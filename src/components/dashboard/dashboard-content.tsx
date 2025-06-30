"use client";

import { StudySessionsChart } from '../charts/study-sessions-chart';
import { UrlSubscriptionChanges } from '../scrapping/url-suscription-changes';

const DashboardContent = () => {
  return (
    <div className="flex-1 flex container p-20 gap-4">
      <StudySessionsChart />
      <UrlSubscriptionChanges urlId='50687438-2fea-4111-bf04-8babdae0fc1f' />
    </div>
  );
};

export { DashboardContent };
