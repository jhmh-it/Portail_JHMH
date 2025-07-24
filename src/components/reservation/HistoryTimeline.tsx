import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, Edit } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ReservationOverrideHistory } from '@/hooks/useReservationHistory';
import { cn } from '@/lib/utils';

interface HistoryTimelineProps {
  history: ReservationOverrideHistory[];
  onHighlightFields?: (fieldNames: string[], date: string) => void;
  className?: string;
}

interface GroupedHistory {
  date: string;
  displayDate: string;
  relativeDate: string;
  overrides: ReservationOverrideHistory[];
}

export function HistoryTimeline({
  history,
  onHighlightFields,
  className,
}: HistoryTimelineProps) {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // Grouper l'historique par date
  const groupedHistory = React.useMemo(() => {
    const groups: Record<string, GroupedHistory> = {};

    history.forEach(override => {
      const date = new Date(override.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        let displayDate: string;
        let relativeDate: string;

        if (isToday(date)) {
          displayDate = "Aujourd'hui";
          relativeDate = format(date, 'HH:mm');
        } else if (isYesterday(date)) {
          displayDate = 'Hier';
          relativeDate = format(date, 'HH:mm');
        } else {
          displayDate = format(date, 'EEEE d MMMM yyyy', { locale: fr });
          relativeDate = formatDistanceToNow(date, {
            locale: fr,
            addSuffix: true,
          });
        }

        groups[dateKey] = {
          date: dateKey,
          displayDate,
          relativeDate,
          overrides: [],
        };
      }

      groups[dateKey].overrides.push(override);
    });

    // Trier par date décroissante et trier les overrides par heure
    return Object.values(groups)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(group => ({
        ...group,
        overrides: group.overrides.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }));
  }, [history]);

  const handleDateClick = (group: GroupedHistory) => {
    const fieldNames = group.overrides.map(override => override.fieldName);
    setSelectedDate(selectedDate === group.date ? null : group.date);

    if (onHighlightFields) {
      onHighlightFields(
        selectedDate === group.date ? [] : fieldNames,
        group.date
      );
    }
  };

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Edit className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune modification</h3>
          <p className="text-muted-foreground">
            Aucune modification manuelle n&apos;a été effectuée sur cette
            réservation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historique des modifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {groupedHistory.map(group => (
              <Collapsible
                key={group.date}
                open={selectedDate === group.date}
                onOpenChange={() => handleDateClick(group)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant={selectedDate === group.date ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-between p-4 h-auto',
                      selectedDate === group.date &&
                        'bg-blue-50 border-blue-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-semibold">
                            {group.displayDate}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {group.relativeDate}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {group.overrides.length} modification
                      {group.overrides.length > 1 ? 's' : ''}
                    </Badge>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 ml-4 space-y-2">
                  {group.overrides.map((override, index) => (
                    <div
                      key={`${override.fieldName}-${index}`}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border-l-4 border-blue-500"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {override.fieldName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {override.overriddenValue}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{override.createdBy}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(override.createdAt), 'HH:mm:ss')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
