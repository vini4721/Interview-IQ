import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => {
      toast.success("Session created successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create room",
      ),
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

export const useSessionById = (id, options = {}) => {
  const { publicRead = false } = options;

  const result = useQuery({
    queryKey: ["session", id, publicRead ? "public" : "private"],
    queryFn: () => sessionApi.getSessionById(id, { publicRead }),
    enabled: !!id,
    refetchInterval: 5000, // refetch every 5 seconds to detect session status changes
  });

  return result;
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => {
      toast.success("Joined session successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => {
      toast.success("Session ended successfully!");
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["myRecentSessions"] });
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useUpdateSessionQuestion = () => {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationKey: ["updateSessionQuestion"],
    mutationFn: ({ id, question }) =>
      sessionApi.updateSessionQuestion(id, question),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session", variables.id] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Failed to save fetched question",
      ),
  });

  return result;
};
