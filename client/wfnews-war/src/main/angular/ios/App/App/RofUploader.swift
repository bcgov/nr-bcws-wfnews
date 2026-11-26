import Capacitor
import Foundation

/// The iOS half of rof-uploader.plugin.ts. It takes report fields only, never a file path or a free address.
@objc(RofUploaderPlugin)
public class RofUploaderPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RofUploaderPlugin"
    public let jsName = "RofUploader"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "enqueue", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pending", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeSent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]

    @objc func enqueue(_ call: CAPPluginCall) {
        guard let id = call.getString("submissionID"), RofRules.isValidSubmissionId(id),
              let url = call.getString("url"), RofRules.allowedUrl(url) != nil,
              let expiresAt = call.getDouble("expiresAt"),
              let resource = call.getString("resource") else {
            call.reject("Report refused")
            return
        }
        let fields: [(String, String?)] = [
            ("resource", resource),
            ("image1", call.getString("image1")),
            ("image2", call.getString("image2")),
            ("image3", call.getString("image3"))
        ]
        do {
            try RofUploadSession.shared.enqueue(id: id, url: url, expiresAt: expiresAt, fields: fields)
            call.resolve()
        } catch {
            call.reject("Report not saved")
        }
    }

    @objc func pending(_ call: CAPPluginCall) {
        call.resolve(["submissionIDs": RofReportStore.shared.pendingIds()])
    }

    @objc func takeSent(_ call: CAPPluginCall) {
        call.resolve(["submissionIDs": RofReportStore.shared.takeSent()])
    }

    @objc func cancel(_ call: CAPPluginCall) {
        guard let id = call.getString("submissionID"), RofRules.isValidSubmissionId(id) else {
            call.reject("Report refused")
            return
        }
        RofUploadSession.shared.cancel(id: id)
        call.resolve()
    }
}

/// The same rules as RofRules.java on Android.
enum RofRules {
    // The ID becomes a file name, so it must not carry a path.
    static func isValidSubmissionId(_ id: String) -> Bool {
        return id.range(of: "\\A[A-Za-z0-9-]{1,64}\\z", options: .regularExpression) != nil
    }

    // Only the notifications API: a script in the WebView must not send a report anywhere else.
    static func allowedUrl(_ text: String) -> URL? {
        guard let parts = URLComponents(string: text),
              parts.scheme == "https",
              parts.user == nil, parts.password == nil,
              parts.port == nil || parts.port == 443,
              let host = parts.host?.lowercased(), host.hasSuffix(".bcwildfireservices.com"),
              parts.path.hasSuffix("/rof"),
              parts.query == nil, parts.fragment == nil else {
            return nil
        }
        return parts.url
    }

    static func isSuccess(_ status: Int) -> Bool {
        return (200..<300).contains(status)
    }

    // A 4xx answer will not change on a retry; 408 and 429 are the exceptions.
    static func isPermanentFailure(_ status: Int) -> Bool {
        return (400..<500).contains(status) && status != 408 && status != 429
    }

    /// Text parts in field order, as the WebView FormData sends them. A nil value is left out.
    static func multipartBody(boundary: String, fields: [(String, String?)]) -> Data {
        var body = ""
        for (name, value) in fields {
            guard let value = value else { continue }
            body += "--\(boundary)\r\n"
            body += "Content-Disposition: form-data; name=\"\(name)\"\r\n"
            body += "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
            body += value + "\r\n"
        }
        body += "--\(boundary)--\r\n"
        return Data(body.utf8)
    }
}

/// The reports that wait for a native send, one body file and one meta file each.
/// In Application Support, out of backups, readable after the first unlock so a locked phone still sends.
final class RofReportStore {
    static let shared = RofReportStore()

    struct Meta: Codable {
        let url: String
        let boundary: String
        let expiresAt: Double
    }

    private let lock = NSLock()
    private let dir: URL
    private let protection: Data.WritingOptions = [.atomic, .completeFileProtectionUntilFirstUserAuthentication]

    private init() {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        dir = support.appendingPathComponent("rof-reports", isDirectory: true)
    }

    private var sentURL: URL { dir.appendingPathComponent("sent.txt") }

    func bodyURL(_ id: String) -> URL { dir.appendingPathComponent(id + ".body") }

    private func metaURL(_ id: String) -> URL { dir.appendingPathComponent(id + ".json") }

    /// Returns false when the report is already saved; a send may be reading that body now.
    func saveIfAbsent(id: String, url: String, expiresAt: Double, fields: [(String, String?)]) throws -> Bool {
        lock.lock()
        defer { lock.unlock() }
        if FileManager.default.fileExists(atPath: metaURL(id).path) {
            return false
        }
        try ensureDir()
        let boundary = "rof-" + UUID().uuidString
        try RofRules.multipartBody(boundary: boundary, fields: fields).write(to: bodyURL(id), options: protection)
        // The meta file goes last: while it is missing, the report does not exist.
        let meta = try JSONEncoder().encode(Meta(url: url, boundary: boundary, expiresAt: expiresAt))
        try meta.write(to: metaURL(id), options: protection)
        return true
    }

    func load(_ id: String) -> Meta? {
        guard let data = try? Data(contentsOf: metaURL(id)) else { return nil }
        return try? JSONDecoder().decode(Meta.self, from: data)
    }

    func delete(_ id: String) {
        lock.lock()
        defer { lock.unlock() }
        try? FileManager.default.removeItem(at: metaURL(id))
        try? FileManager.default.removeItem(at: bodyURL(id))
    }

    func pendingIds() -> [String] {
        let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
        return names.filter { $0.hasSuffix(".json") }.map { String($0.dropLast(5)) }
    }

    func markSent(_ id: String) {
        lock.lock()
        defer { lock.unlock() }
        var ids = readSent()
        if !ids.contains(id) {
            ids.append(id)
        }
        try? ensureDir()
        try? Data(ids.joined(separator: "\n").utf8).write(to: sentURL, options: protection)
    }

    func takeSent() -> [String] {
        lock.lock()
        defer { lock.unlock() }
        let ids = readSent()
        try? FileManager.default.removeItem(at: sentURL)
        return ids
    }

    private func readSent() -> [String] {
        guard let text = try? String(contentsOf: sentURL, encoding: .utf8) else { return [] }
        return text.split(separator: "\n").map(String.init).filter(RofRules.isValidSubmissionId)
    }

    private func ensureDir() throws {
        if FileManager.default.fileExists(atPath: dir.path) {
            return
        }
        try FileManager.default.createDirectory(
            at: dir,
            withIntermediateDirectories: true,
            attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
        )
        var folder = dir
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try folder.setResourceValues(values)
    }
}

/// A background URLSession: iOS keeps each upload, waits for a network and sends it, also with the app
/// suspended or closed by the system. A user who swipes the app away cancels it until the next launch.
final class RofUploadSession: NSObject, URLSessionDataDelegate {
    static let shared = RofUploadSession()
    static let identifier = "ca.bc.gov.WildfireInformation.rof-upload"

    /// iOS gives this when it starts the app to report finished uploads; it must be called when done.
    var backgroundCompletion: (() -> Void)?

    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.background(withIdentifier: RofUploadSession.identifier)
        config.isDiscretionary = false
        config.sessionSendsLaunchEvents = true
        config.timeoutIntervalForResource = 24 * 60 * 60
        config.httpAdditionalHeaders = ["User-Agent": "bc-wildfire-ios"]
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    /// Reconnects to uploads from an earlier launch, and starts again any saved report with no upload.
    func start() {
        session.getAllTasks { tasks in
            let running = Set(tasks.compactMap { $0.taskDescription })
            for id in RofReportStore.shared.pendingIds() where !running.contains(id) {
                self.startTask(id: id, delay: 0)
            }
        }
    }

    func enqueue(id: String, url: String, expiresAt: Double, fields: [(String, String?)]) throws {
        _ = try RofReportStore.shared.saveIfAbsent(id: id, url: url, expiresAt: expiresAt, fields: fields)
        session.getAllTasks { tasks in
            if !tasks.contains(where: { $0.taskDescription == id }) {
                self.startTask(id: id, delay: 0)
            }
        }
    }

    func cancel(id: String) {
        RofReportStore.shared.delete(id)
        session.getAllTasks { tasks in
            tasks.filter { $0.taskDescription == id }.forEach { $0.cancel() }
        }
    }

    private func startTask(id: String, delay: TimeInterval) {
        let store = RofReportStore.shared
        guard let meta = store.load(id),
              let url = RofRules.allowedUrl(meta.url),
              Date().timeIntervalSince1970 * 1000 < meta.expiresAt else {
            NSLog("RofUpload %@: dropped, expired or address not allowed", id)
            store.delete(id)
            return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(meta.boundary)", forHTTPHeaderField: "Content-Type")
        let task = session.uploadTask(with: request, fromFile: store.bodyURL(id))
        task.taskDescription = id
        if delay > 0 {
            task.earliestBeginDate = Date().addingTimeInterval(delay)
        }
        task.resume()
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse,
                    newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) {
        // A redirect could lead the report away from the notifications API.
        completionHandler(nil)
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard let id = task.taskDescription, RofRules.isValidSubmissionId(id) else { return }
        let store = RofReportStore.shared
        if let error = error as NSError? {
            if error.code == NSURLErrorCancelled {
                return
            }
            NSLog("RofUpload %@: error %ld, retry", id, error.code)
            startTask(id: id, delay: 60)
            return
        }
        let status = (task.response as? HTTPURLResponse)?.statusCode ?? 0
        NSLog("RofUpload %@: HTTP %ld", id, status)
        if RofRules.isSuccess(status) {
            // Sent is recorded before the delete: a crash between the two gives a resend, which the server drops.
            store.markSent(id)
            store.delete(id)
        } else if RofRules.isPermanentFailure(status) {
            store.delete(id)
        } else {
            startTask(id: id, delay: 60)
        }
    }

    func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
        DispatchQueue.main.async {
            self.backgroundCompletion?()
            self.backgroundCompletion = nil
        }
    }
}
