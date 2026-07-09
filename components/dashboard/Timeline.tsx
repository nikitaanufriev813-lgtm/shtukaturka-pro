import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TimelineReport {
  id: string;
  date: Date;
  roomName: string;
  wallsArea: number;
  ceilingArea: number;
  comment?: string | null;
  photoUrls: string[];
}

export function Timeline({ reports }: { reports: TimelineReport[] }) {
  if (reports.length === 0) {
    return <p className="text-sm text-gray-400">Пока нет отчётов по этому проекту.</p>;
  }

  return (
    <div className="relative flex flex-col gap-8 pl-6">
      <div className="absolute bottom-0 left-2 top-0 w-px bg-gray-200 dark:bg-white/10" />

      {reports.map((report) => (
        <div key={report.id} className="relative">
          <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-accent" />
          <p className="text-xs font-medium text-gray-400">
            {format(report.date, "d MMMM, EEEE", { locale: ru })}
          </p>
          <div className="card mt-2 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{report.roomName}</h4>
              <span className="text-xs text-gray-400">
                {report.wallsArea + report.ceilingArea} м² оштукатурено
              </span>
            </div>
            {report.comment && (
              <p className="mt-1 text-sm text-gray-500">{report.comment}</p>
            )}
            {report.photoUrls.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {report.photoUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Фото отчёта ${report.roomName}`}
                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
