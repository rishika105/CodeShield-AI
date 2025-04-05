import { useEffect, useState } from 'react';

const AnimatedProgress = ({ value, colorFrom, colorTo }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full bg-indigoDark-700 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full bg-gradient-to-r ${colorFrom} ${colorTo}`}
        style={{ width: `${progress}%`, transition: 'width 0.8s ease-in-out' }}
      ></div>
    </div>
  );
};

export default AnimatedProgress;