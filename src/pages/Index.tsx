import PhaserGame from '@/components/PhaserGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-5">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-heading text-primary tracking-widest drop-shadow-lg">
          HOOP SHOT
        </h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-wide">
          Pull back &amp; release to shoot!
        </p>
      </div>
      <PhaserGame />
      <p className="text-muted-foreground/40 text-xs tracking-wide">
        Drag from the ball to aim • Release to shoot • Tap to restart
      </p>
    </div>
  );
};

export default Index;
