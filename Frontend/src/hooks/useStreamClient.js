import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { StreamChat } from "stream-chat";
import { sessionApi } from "../api/sessions";
import { disconnectStreamClient, initializeStreamClient } from "../lib/stream";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    if (!loadingSession && !session) {
      setIsInitializingCall(false);
      return () => {};
    }

    const initCall = async () => {
      setIsInitializingCall(true);

      if (!session?.callId) {
        setIsInitializingCall(false);
        return;
      }
      if (!isHost && !isParticipant) {
        setIsInitializingCall(false);
        return;
      }
      if (session.status === "completed") {
        setIsInitializingCall(false);
        return;
      }

      try {
        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token,
        );

        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);

        // Chat is secondary; if it fails we still keep video/editor session alive.
        try {
          const apiKey = import.meta.env.VITE_STREAM_API_KEY;
          chatClientInstance = StreamChat.getInstance(apiKey);

          // StreamChat is a singleton; reconnect if it is bound to a different user.
          if (
            chatClientInstance.userID &&
            chatClientInstance.userID !== userId
          ) {
            await chatClientInstance.disconnectUser();
          }

          if (!chatClientInstance.userID) {
            await chatClientInstance.connectUser(
              {
                id: userId,
                name: userName,
                image: userImage,
              },
              token,
            );
          }

          setChatClient(chatClientInstance);

          const chatChannel = chatClientInstance.channel(
            "messaging",
            session.callId,
          );

          try {
            await chatChannel.watch();
          } catch (watchError) {
            // In some races, participant membership may not be reflected yet on Stream.
            if (!isHost && session?._id) {
              try {
                await sessionApi.joinSession(session._id);
                await chatChannel.watch();
              } catch (retryError) {
                throw retryError;
              }
            } else {
              throw watchError;
            }
          }

          setChannel(chatChannel);
        } catch (chatError) {
          console.warn("Chat init failed (non-blocking):", chatError);
        }
      } catch (error) {
        // Only show this toast when video call setup itself fails.
        toast.error("Failed to join video call");
        console.error("Error init call", error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) initCall();

    // cleanup - performance reasons
    return () => {
      // iife
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
