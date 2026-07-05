import * as React from 'react';
export default function useRefs(): readonly [(key: React.Key, element: HTMLDivElement | null) => void, (key: React.Key) => HTMLDivElement | null | undefined];
