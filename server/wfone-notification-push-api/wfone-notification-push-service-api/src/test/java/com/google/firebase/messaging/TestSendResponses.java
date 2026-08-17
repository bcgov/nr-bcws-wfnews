package com.google.firebase.messaging;

import com.google.firebase.ErrorCode;
import com.google.firebase.FirebaseException;

/**
 * Lives in the firebase package because SendResponse is final and its factory methods are
 * package private.
 */
public final class TestSendResponses {

	private TestSendResponses() {
	}

	public static SendResponse success(String messageId) {
		return SendResponse.fromMessageId(messageId);
	}

	public static SendResponse failure(MessagingErrorCode messagingErrorCode, ErrorCode errorCode) {
		FirebaseException cause = new FirebaseException(errorCode, "test failure " + messagingErrorCode, null);

		return SendResponse.fromException(FirebaseMessagingException.withMessagingErrorCode(cause, messagingErrorCode));
	}

	public static BatchResponse batch(java.util.List<SendResponse> responses) {
		return new BatchResponse() {

			@Override
			public java.util.List<SendResponse> getResponses() {
				return responses;
			}

			@Override
			public int getSuccessCount() {
				return (int) responses.stream().filter(SendResponse::isSuccessful).count();
			}

			@Override
			public int getFailureCount() {
				return responses.size() - getSuccessCount();
			}
		};
	}
}
