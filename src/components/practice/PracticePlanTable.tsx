import { formatPracticeDuration } from '@/lib/dashboard-data';
import { getPracticePlanDuration } from '@/lib/practice-plan';
import type { PracticePhase, RepertoireItem } from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';

function getLinkedPart(
  phase: PracticePhase,
  repertoireItems: RepertoireItem[],
) {
  if (!phase.repertoireItemId || !phase.repertoirePartId) return null;

  const item = repertoireItems.find(
    (candidate) => candidate.id === phase.repertoireItemId,
  );
  const part = item?.parts.find(
    (candidate) => candidate.id === phase.repertoirePartId,
  );

  return item && part ? `${item.title} · ${part.name}` : null;
}

export function PracticePlanTable({
  phases,
  repertoireItems,
}: {
  phases: PracticePhase[];
  repertoireItems: RepertoireItem[];
}) {
  const text = useI18nSection('practice');
  const skills = useI18nSection('skills');
  const totalMinutes = getPracticePlanDuration(phases);

  return (
    <section
       aria-label={text.sessionName}
      className='enter overflow-hidden'
    >
      <div className='overflow-x-auto'>
        <table className='w-full table-fixed text-left'>
          <colgroup>
            <col className='w-[27%] sm:w-[22%]' />
            <col className='w-[53%] sm:w-[63%]' />
            <col className='w-[20%] sm:w-[15%]' />
          </colgroup>
          <thead className='bg-canvas/70'>
            <tr className='font-mono text-[10px] uppercase tracking-[0.1em] text-muted sm:text-xs'>
              <th
                scope='col'
                className='px-3 py-3 font-normal sm:px-5'
              >
                 {text.currentBlock}
              </th>
              <th
                scope='col'
                className='px-3 py-3 font-normal sm:px-5'
              >
                 {text.exercises}
              </th>
              <th
                scope='col'
                className='px-3 py-3 text-right font-normal sm:px-5'
              >
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody>
            {phases.map((phase, index) => {
              const linkedPart = getLinkedPart(phase, repertoireItems);
              const resources = phase.resources ?? [];
              const exercises = phase.exercises ?? [];
              const hasDetails =
                exercises.length > 0 ||
                linkedPart !== null ||
                resources.length > 0;

              return (
                <tr
                  key={`${phase.id}-${index}`}
                  className='border-t border-line align-top'
                >
                  <th
                    scope='row'
                    className='px-3 py-4 text-sm font-medium text-ink sm:px-5'
                  >
                    <span className='block break-words'>
                       {phase.name || `${text.currentBlock} ${index + 1}`}
                    </span>
                    <span className='mt-1 block text-xs font-normal text-muted'>
                       {skills[phase.skill]}
                    </span>
                  </th>
                  <td className='px-3 py-4 text-xs leading-relaxed text-muted sm:px-5 sm:text-sm'>
                    {hasDetails ?
                      <div className='space-y-1.5'>
                        {exercises.length > 0 && (
                          <p>
                             <span className='text-ink'>{text.exercises}:</span>{' '}
                            {exercises.join(', ')}
                          </p>
                        )}
                        {linkedPart && (
                          <p>
                             <span className='text-ink'>{text.repertoirePart}:</span>{' '}
                            {linkedPart}
                          </p>
                        )}
                        {resources.length > 0 && (
                          <p>
                             <span className='text-ink'>{text.material}:</span>{' '}
                            {resources
                              .map((resource) => resource.title)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    : <span className='italic text-muted/70'>
                         {text.noDetails}
                      </span>
                    }
                  </td>
                  <td className='whitespace-nowrap px-3 py-4 text-right font-mono text-sm tabular-nums text-ink sm:px-5'>
                    {phase.durationMinutes} min
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className='border-t border-line bg-canvas/70'>
            <tr>
              <th
                scope='row'
                colSpan={2}
                className='px-3 py-3 text-right text-xs uppercase tracking-[0.1em] text-muted sm:px-5'
              >
                 {text.total}
              </th>
              <td className='whitespace-nowrap px-3 py-3 text-right font-mono text-sm font-medium text-accent-green-fg sm:px-5'>
                {formatPracticeDuration(totalMinutes)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
