import Capacitor
import UIKit

// Main.storyboard names this class, so the app's own plugins register with the bridge.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(RofUploaderPlugin())
    }
}
