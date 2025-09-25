import { useTVLayout } from '../hooks/useTVLayout';

export function DebugTV() {
  const isTVLayout = useTVLayout();
  
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>TV Layout: {isTVLayout ? 'SIM' : 'NÃO'}</div>
      <div>Width: {window.innerWidth}px</div>
      <div>Height: {window.innerHeight}px</div>
    </div>
  );
}
