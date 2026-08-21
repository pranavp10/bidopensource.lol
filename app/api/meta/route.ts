import { type NextRequest } from "next/server";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Zig: "#ec915c",
  Elixir: "#6e4a7e",
  Lua: "#000080",
};

function parseGithubUrl(rawUrl: string): { owner: string; repo: string } | null {
  const cleaned = rawUrl
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^github\.com\//i, "")
    .replace(/\/+$/, "");
  const parts = cleaned.split("/");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  const trimmed = targetUrl.trim();
  const gh = parseGithubUrl(trimmed);

  if (gh) {
    try {
      const res = await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "bidopensource-app",
        },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const data = await res.json();
        return Response.json({
          isGithub: true,
          name: data.name ?? `${gh.owner}/${gh.repo}`,
          fullName: data.full_name,
          url: data.html_url ?? `https://github.com/${gh.owner}/${gh.repo}`,
          description: data.description ?? "",
          stars: data.stargazers_count ?? 0,
          forks: data.forks_count ?? 0,
          language: data.language ?? null,
          langColor: data.language ? LANGUAGE_COLORS[data.language] ?? "#8b949e" : null,
          favicon: data.owner?.avatar_url ?? `https://github.com/${gh.owner}.png`,
        });
      }
    } catch (e) {
      console.warn("GitHub fetch error:", e);
    }
  }

  // Generic website fallback
  const normalised = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  const domain = normalised.replace(/^https?:\/\//, "").split("/")[0];
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return Response.json({
    isGithub: false,
    name: domain,
    url: normalised,
    description: "",
    stars: 0,
    forks: 0,
    language: null,
    langColor: null,
    favicon,
  });
}
