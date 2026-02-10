"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Apple,
  Smartphone,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  X,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    body: string;
    reviewerNickname: string;
    createdDate: string;
    platform: "ios" | "android";
    version: string;
  };
  index: number;
}

function getSentiment(rating: number, body: string): {
  label: string;
  color: string;
  emoji: string;
} {
  // Rating-based primary signal
  if (rating >= 4) return { label: "Positive", color: "text-[#22c55e]", emoji: "😊" };
  if (rating === 3) {
    // Check body for more nuance
    const negWords = /bug|crash|fix|broken|slow|error|issue|problem|terrible|awful|worst|hate|annoying/i;
    const posWords = /great|love|good|nice|helpful|amazing|awesome|excellent|enjoy/i;
    if (negWords.test(body)) return { label: "Mixed", color: "text-[#f59e0b]", emoji: "😐" };
    if (posWords.test(body)) return { label: "Neutral+", color: "text-[#f59e0b]", emoji: "🤷" };
    return { label: "Neutral", color: "text-[#f59e0b]", emoji: "😐" };
  }
  // Rating 1-2
  const criticalWords = /crash|bug|broken|error|freeze|hang|stuck|loop|data.?loss/i;
  if (criticalWords.test(body)) return { label: "Critical", color: "text-[#ef4444]", emoji: "🔥" };
  return { label: "Negative", color: "text-[#ef4444]", emoji: "😞" };
}

function generateSuggestedReply(review: ReviewCardProps["review"]): string {
  const name = review.reviewerNickname !== "Anonymous" ? review.reviewerNickname : "";
  const greeting = name ? `Hi ${name},\n\n` : "Hi there,\n\n";

  if (review.rating >= 4) {
    return `${greeting}Thank you so much for your kind review! We're thrilled that you're enjoying Shinobi Japanese. Your support means a lot to our team. 🥷\n\nIf you have any suggestions for improvement, we'd love to hear them!\n\nBest regards,\nThe Shinobi Team`;
  }

  if (review.rating === 3) {
    return `${greeting}Thank you for your feedback! We appreciate you taking the time to share your experience with Shinobi Japanese.\n\nWe're always working to improve the app. Could you let us know what we could do better? Your input helps us prioritize our next updates.\n\nBest regards,\nThe Shinobi Team`;
  }

  // 1-2 stars
  return `${greeting}We're sorry to hear about your experience. Your feedback is important to us, and we want to make things right.\n\nCould you reach out to us at support@shinobijapanese.com so we can help resolve this? We'd love to understand the issue better and work on a fix.\n\nBest regards,\nThe Shinobi Team`;
}

export function ReviewCard({ review, index }: ReviewCardProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentiment = getSentiment(review.rating, review.body);

  const platformIcon =
    review.platform === "ios" ? (
      <Apple className="w-3.5 h-3.5" />
    ) : (
      <Smartphone className="w-3.5 h-3.5" />
    );

  const platformColor =
    review.platform === "ios"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
      : "bg-green-500/10 text-green-400 border-green-500/30";

  const ratingColor = (rating: number) => {
    if (rating >= 4) return "text-[#22c55e]";
    if (rating === 3) return "text-[#f59e0b]";
    return "text-[#ef4444]";
  };

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          platform: review.platform,
          replyText: replyText.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        setTimeout(() => {
          setShowReply(false);
          setSent(false);
          setReplyText("");
        }, 2000);
      } else {
        setError(data.error || "Failed to send reply");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSending(false);
    }
  }

  function handleUseSuggestion() {
    setReplyText(generateSuggestedReply(review));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-[#111118] border-[#1e1e2e] hover:border-[#6366f1]/30 transition-colors">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${ratingColor(review.rating)}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    fill={i < review.rating ? "currentColor" : "none"}
                    strokeWidth={i < review.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <Badge variant="outline" className={platformColor}>
                <span className="flex items-center gap-1">
                  {platformIcon}
                  {review.platform === "ios" ? "iOS" : "Android"}
                </span>
              </Badge>
              <span className={`text-xs ${sentiment.color}`}>
                {sentiment.emoji} {sentiment.label}
              </span>
            </div>
            <span className="text-xs text-[#94a3b8]">
              v{review.version}
            </span>
          </div>

          {/* Title */}
          {review.title && (
            <h3 className="text-sm font-medium text-[#f1f5f9] mb-1">
              {review.title}
            </h3>
          )}

          {/* Body */}
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            {review.body}
          </p>

          {/* Footer + Reply Button */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e1e2e]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#94a3b8]">
                {review.reviewerNickname}
              </span>
              <span className="text-xs text-[#64748b]">
                {formatDate(review.createdDate)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-[#94a3b8] hover:text-[#6366f1] hover:bg-[#6366f1]/10 h-7 px-2"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              Reply
            </Button>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReply && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-[#1e1e2e] space-y-3">
                  {sent ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 py-4 text-[#22c55e]"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Reply sent successfully!</span>
                    </motion.div>
                  ) : (
                    <>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows={4}
                        className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-[#f1f5f9] placeholder:text-[#64748b] focus:outline-none focus:border-[#6366f1]/50 resize-none"
                        maxLength={5970}
                      />

                      {error && (
                        <div className="flex items-center gap-2 text-xs text-[#ef4444]">
                          <X className="w-3.5 h-3.5" />
                          {error}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleUseSuggestion}
                            className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] hover:bg-[#a78bfa]/10 h-7 px-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Suggest reply
                          </Button>
                          <span className="text-xs text-[#64748b]">
                            {replyText.length}/5970
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowReply(false);
                              setReplyText("");
                              setError(null);
                            }}
                            className="text-xs h-7 px-2"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSendReply}
                            disabled={!replyText.trim() || sending}
                            className="bg-[#6366f1] hover:bg-[#5558e6] text-white text-xs h-7 px-3"
                          >
                            {sending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <Send className="w-3.5 h-3.5 mr-1" />
                            )}
                            {sending ? "Sending..." : "Send Reply"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
