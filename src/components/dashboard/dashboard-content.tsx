"use client";

import React from 'react';
import { StudySessionsChart } from '../charts/study-sessions-chart';

const DashboardContent = () => {
  return (
    <div className="flex-1 flex container p-20">
      <StudySessionsChart />
    </div>
  );
};

export { DashboardContent };