/* =================================================================
   路由页面切换过渡包装器
   ================================================================= */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    // 淡出旧页面
    setTransitionStage('fadeOut');
    const timer = setTimeout(() => {
      // 换内容，然后淡入
      setDisplayChildren(children);
      setTransitionStage('fadeIn');
    }, 150); // 动画时长 150ms
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: transitionStage === 'fadeIn' ? 1 : 0,
        transform: transitionStage === 'fadeIn' ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {displayChildren}
    </div>
  );
}
