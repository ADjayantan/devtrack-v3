const LoadingSpinner = ({ fullScreen = false }) => {
  const wrapper = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-navy-900'
    : 'flex items-center justify-center py-12';

  return (
    <div className={wrapper}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-cyan-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
