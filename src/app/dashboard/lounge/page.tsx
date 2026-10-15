
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import LoungeWelcome from "@/components/LoungeWelcome";
import LoungePostComposer from "@/components/LoungePostComposer";
import LoungeFeed from "@/components/LoungeFeed";

type LoungePost = {
  id: string;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
};

type LoungeAuthor = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_path: string | null;
};

type LoungePhoto = {
  id: string;
  post_id: string;
  storage_path: string;
  position: number;
};

type LoungeLike = {
  post_id: string;
  user_id: string;
};

export default async function LoungePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: loungeProfile, error } = await supabase
    .from("lounge_profiles")
    .select(
      "display_name, username, welcome_completed, avatar_path"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("LOUNGE PROFILE ERROR:", error);

    return (
      <main className="min-h-screen bg-[#F7F1ED] p-8 text-center text-[#806D65]">
        We couldn&apos;t load the Lounge right now. Please try
        again.
      </main>
    );
  }

  if (!loungeProfile?.welcome_completed) {
    return (
      <LoungeWelcome
        userId={user.id}
        defaultName=""
      />
    );
  }

  const displayName =
    loungeProfile.display_name || "Lounge Member";

  const avatarUrl = loungeProfile.avatar_path
    ? supabase.storage
        .from("lounge-avatars")
        .getPublicUrl(loungeProfile.avatar_path).data.publicUrl
    : null;

  // Load newest posts.
  const { data: postsData, error: postsError } = await supabase
    .from("lounge_posts")
    .select("id, user_id, content, category, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (postsError) {
    console.error("LOUNGE POSTS ERROR:", postsError);
  }

  const posts: LoungePost[] = postsData ?? [];

  const postIds = posts.map((post) => post.id);

  const authorIds = [
    ...new Set(posts.map((post) => post.user_id)),
  ];

  // Load post authors.
  let authors: LoungeAuthor[] = [];

  if (authorIds.length > 0) {
    const { data, error: authorsError } = await supabase
      .from("lounge_profiles")
      .select("user_id, display_name, username, avatar_path")
      .in("user_id", authorIds);

    if (authorsError) {
      console.error("LOUNGE AUTHORS ERROR:", authorsError);
    }

    authors = data ?? [];
  }

  // Load post photo records.
  let photos: LoungePhoto[] = [];

  if (postIds.length > 0) {
    const { data, error: photosError } = await supabase
      .from("lounge_post_photos")
      .select("id, post_id, storage_path, position")
      .in("post_id", postIds)
      .order("position", { ascending: true });

    if (photosError) {
      console.error("LOUNGE PHOTOS ERROR:", photosError);
    }

    photos = data ?? [];
  }

  // NEW: Load likes for the posts in our feed.
  let likes: LoungeLike[] = [];

  if (postIds.length > 0) {
    const { data, error: likesError } = await supabase
      .from("lounge_post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    if (likesError) {
      console.error("LOUNGE LIKES ERROR:", likesError);
    }

    likes = data ?? [];
  }

  // Build like counts and track the current member's likes.
  const likeCounts = new Map<string, number>();
  const likedPostIds = new Set<string>();

  for (const like of likes) {
    likeCounts.set(
      like.post_id,
      (likeCounts.get(like.post_id) ?? 0) + 1
    );

    if (like.user_id === user.id) {
      likedPostIds.add(like.post_id);
    }
  }

  // Generate temporary links for private post photos.
  const photoPaths = photos.map(
    (photo) => photo.storage_path
  );

  const photoUrls = new Map<string, string>();

  if (photoPaths.length > 0) {
    const { data: signedPhotos, error: signedError } =
      await supabase.storage
        .from("lounge-posts")
        .createSignedUrls(photoPaths, 60 * 60);

    if (signedError) {
      console.error(
        "LOUNGE SIGNED URL ERROR:",
        signedError
      );
    }

    signedPhotos?.forEach((photo, index) => {
      if (photo.signedUrl) {
        photoUrls.set(
          photoPaths[index],
          photo.signedUrl
        );
      }
    });
  }

  const authorMap = new Map(
    authors.map((author) => [
      author.user_id,
      author,
    ])
  );

  // Prepare posts for our interactive feed.
  const feedPosts = posts.map((post) => {
    const author = authorMap.get(post.user_id);

    const authorName =
      author?.display_name || "Lounge Member";

    const authorAvatar = author?.avatar_path
      ? supabase.storage
          .from("lounge-avatars")
          .getPublicUrl(author.avatar_path).data.publicUrl
      : null;

    const postPhotos = photos
      .filter((photo) => photo.post_id === post.id)
      .map((photo) => ({
        id: photo.id,
        storagePath: photo.storage_path,
        url: photoUrls.get(photo.storage_path) || "",
      }))
      .filter((photo) => photo.url !== "");

    return {
      id: post.id,
      userId: post.user_id,
      content: post.content,
      category: post.category,
      createdAt: post.created_at,
      authorName,
      authorUsername: author?.username || null,
      authorAvatar,
      photos: postPhotos,

      // NEW: Likes data.
      likeCount: likeCounts.get(post.id) ?? 0,
      likedByMe: likedPostIds.has(post.id),
    };
  });

  return (
    <main className="min-h-screen bg-[#F7F1ED] px-5 pb-28 pt-8 text-[#302521]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-9">
          <p className="mb-3 text-[10px] tracking-[0.3em] text-[#A77B73]">
            YOUR COMMUNITY SPACE
          </p>

          <h1 className="font-serif text-4xl tracking-tight">
            The Lock In Lounge
            <span className="ml-2 text-[#A77B73]">
              ♡
            </span>
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#806D65]">
            A little space to show up, share your wins,
            and keep each other going.
          </p>
        </header>

        <LoungePostComposer
          displayName={displayName}
          username={loungeProfile.username}
          avatarUrl={avatarUrl}
        />

        {postsError ? (
          <section className="rounded-3xl border border-[#E9DAD3] bg-white px-6 py-10 text-center">
            <p className="text-sm text-[#806D65]">
              We couldn&apos;t load the community feed right
              now. Please try again.
            </p>
          </section>
        ) : (
          <LoungeFeed
            posts={feedPosts}
            currentUserId={user.id}
          />
        )}

        <footer className="mt-10 text-center">
          <p className="text-[10px] tracking-[0.12em] text-[#A18A82]">
            YOUR JOURNEY IS PERSONAL.
          </p>

          <p className="mt-1 font-serif text-sm italic text-[#A77B73]">
            Your community doesn&apos;t have to be.
          </p>

          <Link
            href="/dashboard/lounge/profile"
            className="mt-5 inline-block text-xs text-[#A77B73] underline underline-offset-4"
          >
            Edit your Lounge profile
          </Link>
        </footer>
      </div>
    </main>
  );
}
