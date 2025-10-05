import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// FIX: Assign motion.div to a variable to help with type inference.
const MotionDiv = motion.div;

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 dark:border-t-black',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 dark:border-b-black',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 dark:border-l-black',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 dark:border-r-black',
  }

  // FIX: Create a props variable to bypass TypeScript's strict excess property checking on object literals.
  const childProps = { 'aria-describedby': content ? 'tooltip' : undefined };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {React.cloneElement(children, childProps)}
      <AnimatePresence>
        {isHovered && content && (
          <MotionDiv
            id="tooltip"
            initial={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'top' ? 5 : -5 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-20 w-max max-w-xs p-2 text-xs text-white bg-slate-800 dark:bg-black rounded-md shadow-lg pointer-events-none ${positionClasses[position]}`}
            role="tooltip"
          >
            {content}
            <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`} />
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
