export interface NovelChapter {
	id: string;
	slug: string;
	title: string;
	book: string;
	bookTitle: string;
	bookDescription: string;
	order: number;
	description: string;
	wordCount?: number;
	body: string;
}

export interface NovelBook {
	slug: string;
	title: string;
	description: string;
	chapters: NovelChapter[];
}

interface NovelMarkdownModule {
	frontmatter?: Record<string, unknown>;
	rawContent?: () => string;
}

const novelModules = import.meta.glob("../content/novels/**/*.md", {
	eager: true,
}) as Record<string, NovelMarkdownModule>;

export async function getNovels(): Promise<NovelBook[]> {
	const books = new Map<string, NovelBook>();

	for (const [, mod] of Object.entries(novelModules)) {
		const data = (mod.frontmatter ?? {}) as Record<string, unknown>;
		const bookSlug = String(data.book ?? "");
		const bookTitle = String(data.bookTitle ?? "未命名小说");
		const bookDescription = String(data.bookDescription ?? "");
		const chapterSlug = String(data.slug ?? "");
		const chapterTitle = String(data.title ?? "未命名章节");
		const chapterOrder = Number(data.order ?? 0);
		const chapterDescription = String(data.description ?? "");
		const wordCount = Number(data.wordCount ?? 0);
		const chapterBody = typeof mod.rawContent === "function" ? mod.rawContent() : "";

		const chapter: NovelChapter = {
			id: chapterSlug,
			slug: chapterSlug,
			title: chapterTitle,
			book: bookSlug,
			bookTitle,
			bookDescription,
			order: chapterOrder,
			description: chapterDescription,
			wordCount: Number.isFinite(wordCount) ? wordCount : undefined,
			body: chapterBody,
		};

		if (!books.has(bookSlug)) {
			books.set(bookSlug, {
				slug: bookSlug,
				title: bookTitle,
				description: bookDescription,
				chapters: [],
			});
		}

		books.get(bookSlug)?.chapters.push(chapter);
	}

	return Array.from(books.values()).map((book) => ({
		...book,
		chapters: book.chapters.sort((a, b) => a.order - b.order),
	}));
}

export async function getNovelBySlug(slug: string): Promise<NovelBook | null> {
	const novels = await getNovels();
	return novels.find((book) => book.slug === slug) ?? null;
}

export async function getChapterBySlug(bookSlug: string, chapterSlug: string) {
	const novel = await getNovelBySlug(bookSlug);
	if (!novel) {
		return null;
	}
	return novel.chapters.find((chapter) => chapter.slug === chapterSlug) ?? null;
}
