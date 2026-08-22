import type { Metadata } from "next";
import ReelFeed from "@/components/ReelFeed";
import { reels } from "@/lib/reels";

export const metadata: Metadata = {
  title: "Reels",
  description:
    "Watch the bangles move — and buy what you see, straight from the reel.",
};

/**
 * The reel feed takes the whole screen, so this page deliberately renders
 * nothing else: no page heading, no padding, no footer whitespace above the
 * fold. That is what makes it read as Reels rather than as a page with videos
 * on it.
 */
export default function ReelsPage() {
  return <ReelFeed items={reels()} />;
}
