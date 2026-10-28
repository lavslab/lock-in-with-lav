
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import LoungeWelcome from "@/components/LoungeWelcome";
import LoungePostComposer from "@/components/LoungePostComposer";
import LoungeFeed from "@/components/LoungeFeed";
import LoungeSpaces from "@/components/LoungeSpaces";
import LoungeNotifications from "@/components/LoungeNotifications";

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


type LoungeVideo = {
  id: string;
  post_id: string;
  storage_path: string;
  duration_seconds: number;
  cover_storage_path: string | null;
};

type LoungeLike = {
  post_id: string;
  user_id: string;
};

type LoungeSavedPost = {
  post_id: string;
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
        We couldn&apos;t load the Lounge right now.
        Please try again.
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
        .getPublicUrl(loungeProfile.avatar_path).data
        .publicUrl
    : null;

  // Load newest posts.
  const [recentPostsResult, savedPostsResult] = await Promise.all([
  supabase
    .from("lounge_posts")
    .select("id, user_id, content, category, created_at")
    .order("created_at", { ascending: false })
    .limit(30),

  supabase
    .from("lounge_saved_posts")
    .select("post_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }),
]);

const { data: postsData, error: postsError } = recentPostsResult;
  if (postsError) {
    console.error("LOUNGE POSTS ERROR:", postsError);
  }


  // Load the current member's saved post IDs.
const { data: savedData, error: savedError } = savedPostsResult;

if (savedError) {
  console.error("LOUNGE SAVED POSTS ERROR:", savedError);
}

const savedPosts: LoungeSavedPost[] = savedData ?? [];

const savedPostIds = savedPosts.map(
  (savedPost) => savedPost.post_id
);
  
let savedPostRecords: LoungePost[] = [];

if (savedPostIds.length > 0) {
  const { data, error: savedPostsError } = await supabase
    .from("lounge_posts")
    .select("id, user_id, content, category, created_at")
    .in("id", savedPostIds);

  if (savedPostsError) {
    console.error(
      "LOUNGE SAVED POST DETAILS ERROR:",
      savedPostsError
    );
  }

  savedPostRecords = data ?? [];
}

// Combine recent posts and saved posts without duplicates.
const postMap = new Map<string, LoungePost>();

for (const post of postsData ?? []) {
  postMap.set(post.id, post);
}

for (const post of savedPostRecords) {
  postMap.set(post.id, post);
}

const posts: LoungePost[] = Array.from(postMap.values());


  const postIds = posts.map((post) => post.id);

  const authorIds = [
    ...new Set(posts.map((post) => post.user_id)),
  ];


  const [authorsResult, photosResult, videosResult, likesResult] =
  await Promise.all([
    authorIds.length > 0
      ? supabase
          .from("lounge_profiles")
          .select("user_id, display_name, username, avatar_path")
          .in("user_id", authorIds)
      : Promise.resolve({ data: [], error: null }),

    postIds.length > 0
      ? supabase
          .from("lounge_post_photos")
          .select("id, post_id, storage_path, position")
          .in("post_id", postIds)
          .order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),

    postIds.length > 0
      ? supabase
          .from("lounge_post_videos")
          .select(
            "id, post_id, storage_path, duration_seconds, cover_storage_path"
          )
          .in("post_id", postIds)
      : Promise.resolve({ data: [], error: null }),

    postIds.length > 0
      ? supabase
          .from("lounge_post_likes")
          .select("post_id, user_id")
          .in("post_id", postIds)
      : Promise.resolve({ data: [], error: null }),
  ]);


  // Load post authors.
  let authors: LoungeAuthor[] = [];

  if (authorIds.length > 0) {
    const { data, error: authorsError } = authorsResult;

    if (authorsError) {
      console.error(
        "LOUNGE AUTHORS ERROR:",
        authorsError
      );
    }

    authors = data ?? [];
  }

  // Load post photos.
  let photos: LoungePhoto[] = [];

  if (postIds.length > 0) {
    const { data, error: photosError } = photosResult;

    if (photosError) {
      console.error(
        "LOUNGE PHOTOS ERROR:",
        photosError
      );
    }

    photos = data ?? [];
  }

  // Load post videos.
  let videos: LoungeVideo[] = [];

  if (postIds.length > 0) {
    const { data, error: videosError } = videosResult;

    if (videosError) {
      console.error("LOUNGE VIDEOS ERROR:", videosError);
    }

    videos = data ?? [];
  }

  // Load likes.
  let likes: LoungeLike[] = [];

  if (postIds.length > 0) {
    const { data, error: likesError } = likesResult;

    if (likesError) {
      console.error(
        "LOUNGE LIKES ERROR:",
        likesError
      );
    }

    likes = data ?? [];
  }

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
const photoPathsForSigning = photos.map(
  (photo) => photo.storage_path
);

const videoPathsForSigning = videos.map(
  (video) => video.storage_path
);

const coverPathsForSigning = [
  ...new Set(
    videos
      .map((video) => video.cover_storage_path)
      .filter((path): path is string => Boolean(path))
  ),
];

const [signedPhotosResult, signedVideosResult, signedCoversResult] =
  await Promise.all([
    photoPathsForSigning.length > 0
      ? supabase.storage
          .from("lounge-posts")
          .createSignedUrls(photoPathsForSigning, 60 * 60)
      : Promise.resolve({ data: [], error: null }),

    videoPathsForSigning.length > 0
      ? supabase.storage
          .from("lounge-videos")
          .createSignedUrls(videoPathsForSigning, 60 * 60)
      : Promise.resolve({ data: [], error: null }),

    coverPathsForSigning.length > 0
      ? supabase.storage
          .from("lounge-video-covers")
          .createSignedUrls(coverPathsForSigning, 60 * 60)
      : Promise.resolve({ data: [], error: null }),
  ]);


  // Generate signed URLs for private photos.
  const photoPaths = photos.map(
    (photo) => photo.storage_path
  );

  const photoUrls = new Map<string, string>();

  if (photoPaths.length > 0) {
    const { data: signedPhotos, error: signedError } =
  signedPhotosResult;

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

  // Generate signed URLs for private videos.
  const videoPaths = videos.map(
    (video) => video.storage_path
  );

  const videoUrls = new Map<string, string>();

  if (videoPaths.length > 0) {
   const { data: signedVideos, error: signedVideoError } =
  signedVideosResult;

    if (signedVideoError) {
      console.error(
        "LOUNGE VIDEO SIGNED URL ERROR:",
        signedVideoError
      );
    }

    signedVideos?.forEach((video, index) => {
      if (video.signedUrl) {
        videoUrls.set(
          videoPaths[index],
          video.signedUrl
        );
      }
    });
  }

  // Create signed URLs for video cover images.
const coverPaths = [
  ...new Set(
    videos
      .map((video) => video.cover_storage_path)
      .filter((path): path is string => Boolean(path))
  ),
];

const videoCoverUrls = new Map<string, string>();

if (coverPaths.length > 0) {
  const { data: signedCovers, error: signedCoverError } =
  signedCoversResult;

  if (signedCoverError) {
    console.error(
      "LOUNGE VIDEO COVER SIGNED URL ERROR:",
      signedCoverError
    );
  }

  signedCovers?.forEach((cover, index) => {
    if (cover.signedUrl) {
      videoCoverUrls.set(
        coverPaths[index],
        cover.signedUrl
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

  // Prepare posts for the interactive feed.
  const feedPosts = posts.map((post) => {
    const author = authorMap.get(post.user_id);

    const authorName =
      author?.display_name || "Lounge Member";

    const authorAvatar = author?.avatar_path
      ? supabase.storage
          .from("lounge-avatars")
          .getPublicUrl(author.avatar_path).data
          .publicUrl
      : null;

    const postPhotos = photos
      .filter(
        (photo) => photo.post_id === post.id
      )
      .map((photo) => ({
        id: photo.id,
        storagePath: photo.storage_path,
        url:
          photoUrls.get(photo.storage_path) || "",
      }))
      .filter((photo) => photo.url !== "");

      
    const postVideoRecord = videos.find(
      (video) => video.post_id === post.id
    );

    const postVideo =
  postVideoRecord &&
  videoUrls.get(postVideoRecord.storage_path)
    ? {
        id: postVideoRecord.id,
        storagePath: postVideoRecord.storage_path,
        url: videoUrls.get(postVideoRecord.storage_path)!,
        duration: postVideoRecord.duration_seconds,
        coverUrl: postVideoRecord.cover_storage_path
          ? videoCoverUrls.get(postVideoRecord.cover_storage_path) ?? null
          : null,
      }
    : null;


    return {
      id: post.id,
      userId: post.user_id,
      content: post.content,
      category: post.category,
      createdAt: post.created_at,
      authorName,
      authorUsername:
        author?.username || null,
      authorAvatar,
      photos: postPhotos,
      video: postVideo,
      likeCount:
        likeCounts.get(post.id) ?? 0,
      likedByMe:
        likedPostIds.has(post.id),
    };
  });

  return (
    <main className="min-h-screen bg-[#F7F1ED] px-5 pb-28 pt-7 text-[#211C19] sm:px-8">
      <div className="mx-auto max-w-2xl">
        {/* PAGE HEADER */}
       

<header className="mb-5 border-b border-[#DED0CB] pb-4">
  <div className="flex items-center justify-between gap-2">
    <h1 className="min-w-0 font-serif text-[24px] leading-tight tracking-tight text-[#211C19] sm:text-[29px]">
      The Lock In{" "}
      <span className="italic text-[#A77B73]">
        Lounge.
      </span>
    </h1>

    <div className="flex shrink-0 items-center gap-2">
      <LoungeNotifications currentUserId={user.id} />

      <Link
        href="/dashboard/lounge/profile"
        aria-label="My Lounge profile"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DED0CB] bg-[#FBF8F6] text-[#806D65] transition hover:border-[#A77B73] hover:text-[#211C19]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      </Link>
    </div>
  </div>

  <p className="mt-2 text-[11px] leading-5 text-[#806D65]">
    A space to connect, share &amp; grow together. ♡
  </p>
</header>



        {/* PUBLIC FEED + PRIVATE CIRCLE TABS */}
        <LoungeSpaces>
          <LoungePostComposer
            displayName={displayName}
            username={loungeProfile.username}
            avatarUrl={avatarUrl}
          />

          {postsError ? (
            <section className="rounded-[1.4rem] border border-[#DED0CB] bg-[#FBF8F6] px-6 py-10 text-center">
              <p className="text-[12px] leading-6 text-[#806D65]">
                We couldn&apos;t load the community feed
                right now. Please try again.
              </p>
            </section>
          ) : (
            <LoungeFeed
  posts={feedPosts.filter((post) =>
    (postsData ?? []).some(
      (recentPost) => recentPost.id === post.id
    )
  )}
  savedPosts={savedPostIds
    .map((id) => feedPosts.find((post) => post.id === id))
    .filter(
      (post): post is (typeof feedPosts)[number] =>
        post !== undefined
    )}
  currentUserId={user.id}
/>
          )}
        </LoungeSpaces>
      </div>
    </main>
  );
}
