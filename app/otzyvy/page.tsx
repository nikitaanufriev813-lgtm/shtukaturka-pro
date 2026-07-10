import { prisma } from "@/lib/prisma";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-surface-light px-6 py-16 dark:bg-surface-dark">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-extrabold">Отзывы наших клиентов</h1>
        <p className="mb-10 text-gray-400">
          Реальные отзывы после завершения механизированной штукатурки
        </p>

        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-6">
              <div className="mb-2 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < review.rating ? "text-accent" : "text-gray-200 dark:text-white/10"}
                  >
                    ★
                  </span>
                ))}
              </div>
              {review.comment && <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>}
              <p className="mt-3 text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-center text-gray-400">Отзывы скоро появятся здесь.</p>
          )}
        </div>
      </div>
    </main>
  );
}
