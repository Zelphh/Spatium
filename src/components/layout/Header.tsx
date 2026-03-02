import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="flex items-center justify-center py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <div className="w-4 h-4 rounded-sm bg-primary-foreground" />
        </div>
        <span className="text-xl font-semibold text-foreground tracking-tight">
          Spatium
        </span>
      </motion.div>
    </header>
  );
}
