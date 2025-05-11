export type ThemeType = 'cyberpunk' | 'luxury' | 'futuristic' | 'glassmorphism' | 'neon';

export interface ThemeConfig {
  name: string;
  container: {
    bg: string;
    pattern?: string;
  };
  card: {
    bg: string;
    text: string;
    border: string;
    shadow: string;
  };
  accent: {
    gradient: string;
    text: string;
    shadow?: string;
  };
  input: {
    bg: string;
    text: string;
    border: string;
    placeholder: string;
    focus: string;
  };
  button: {
    primary: {
      bg: string;
      text: string;
      hover: string;
      shadow?: string;
    };
    secondary: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
  };
  states: {
    open: {
      bg: string;
      text: string;
      glow?: string;
    };
    closed: {
      bg: string;
      text: string;
    };
  };
  message: {
    sent: {
      bg: string;
      text: string;
      shadow?: string;
    };
    received: {
      bg: string;
      text: string;
      border: string;
      shadow?: string;
    };
  };
  special: {
    highlight: string;
    pulse: string;
    glow: string;
    backdrop: string;
    overlay: string;
  };
}

const themes: Record<ThemeType, ThemeConfig> = {
  cyberpunk: {
    name: "Cyberpunk",
    container: {
      bg: 'bg-gradient-to-br from-neutral-900 via-blue-900 to-fuchsia-900',
      pattern: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0.5px,transparent_1px)] bg-[length:24px_24px]',
    },
    card: {
      bg: 'bg-black bg-opacity-80 backdrop-blur-md',
      text: 'text-cyan-400',
      border: 'border border-cyan-500/30',
      shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    },
    accent: {
      gradient: 'from-fuchsia-600 to-cyan-600',
      text: 'text-white',
      shadow: 'shadow-[0_0_8px_rgba(192,38,211,0.5)]',
    },
    input: {
      bg: 'bg-black bg-opacity-70',
      text: 'text-cyan-300',
      border: 'border border-cyan-700/80',
      placeholder: 'placeholder-cyan-800',
      focus: 'focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500',
    },
    button: {
      primary: {
        bg: 'bg-gradient-to-r from-fuchsia-600 to-cyan-600',
        text: 'text-white',
        hover: 'hover:from-fuchsia-700 hover:to-cyan-700',
        shadow: 'shadow-[0_0_15px_rgba(192,38,211,0.5)]',
      },
      secondary: {
        bg: 'bg-black bg-opacity-60',
        text: 'text-cyan-400',
        border: 'border border-cyan-700',
        hover: 'hover:border-cyan-500',
      },
    },
    states: {
      open: {
        bg: 'bg-green-900/30',
        text: 'text-green-400',
        glow: 'shadow-[0_0_8px_rgba(52,211,153,0.5)]',
      },
      closed: {
        bg: 'bg-red-900/30',
        text: 'text-red-400',
      },
    },
    message: {
      sent: {
        bg: 'bg-gradient-to-r from-fuchsia-600 to-cyan-600',
        text: 'text-white',
        shadow: 'shadow-[0_2px_8px_rgba(192,38,211,0.4)]',
      },
      received: {
        bg: 'bg-neutral-900/90',
        text: 'text-cyan-300',
        border: 'border border-cyan-700/50',
        shadow: 'shadow-md',
      },
    },
    special: {
      highlight: 'text-fuchsia-400',
      pulse: 'animate-pulse text-cyan-400',
      glow: 'shadow-[0_0_10px_rgba(6,182,212,0.7)]',
      backdrop: 'backdrop-blur-lg bg-black/30',
      overlay: 'bg-gradient-to-br from-black/80 to-fuchsia-900/30 backdrop-blur-md',
    },
  },
  
  luxury: {
    name: "Luxury",
    container: {
      bg: 'bg-gradient-to-b from-neutral-900 to-neutral-800',
      pattern: 'bg-[url("/luxury-pattern.svg")]',
    },
    card: {
      bg: 'bg-gradient-to-br from-neutral-900 to-neutral-800',
      text: 'text-amber-100',
      border: 'border border-amber-900/30',
      shadow: 'shadow-xl shadow-amber-900/20',
    },
    accent: {
      gradient: 'from-amber-500 to-yellow-600',
      text: 'text-neutral-900',
    },
    input: {
      bg: 'bg-neutral-800',
      text: 'text-amber-100',
      border: 'border border-amber-800/50',
      placeholder: 'placeholder-neutral-600',
      focus: 'focus:border-amber-500 focus:ring-1 focus:ring-amber-500',
    },
    button: {
      primary: {
        bg: 'bg-gradient-to-r from-amber-500 to-yellow-600',
        text: 'text-neutral-900 font-medium',
        hover: 'hover:from-amber-600 hover:to-yellow-700',
        shadow: 'shadow-lg shadow-amber-900/30',
      },
      secondary: {
        bg: 'bg-transparent',
        text: 'text-amber-300',
        border: 'border border-amber-700',
        hover: 'hover:border-amber-500 hover:text-amber-400',
      },
    },
    states: {
      open: {
        bg: 'bg-green-800/20',
        text: 'text-green-300',
      },
      closed: {
        bg: 'bg-amber-900/20',
        text: 'text-amber-400',
      },
    },
    message: {
      sent: {
        bg: 'bg-gradient-to-r from-amber-600 to-amber-700',
        text: 'text-amber-100',
        shadow: 'shadow-md shadow-amber-900/30',
      },
      received: {
        bg: 'bg-neutral-800',
        text: 'text-amber-100',
        border: 'border border-amber-900/30',
        shadow: 'shadow-md',
      },
    },
    special: {
      highlight: 'text-amber-400',
      pulse: 'animate-pulse text-amber-300',
      glow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      backdrop: 'backdrop-blur-lg bg-black/40',
      overlay: 'bg-gradient-to-br from-black/80 to-amber-900/20 backdrop-blur-md',
    },
  },
  
  futuristic: {
    name: "Futuristic",
    container: {
      bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
      pattern: 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]',
    },
    card: {
      bg: 'bg-slate-900/80 backdrop-blur-sm',
      text: 'text-slate-100',
      border: 'border border-slate-700/50',
      shadow: 'shadow-lg shadow-indigo-500/10',
    },
    accent: {
      gradient: 'from-indigo-500 to-sky-500',
      text: 'text-white',
      shadow: 'shadow-[0_0_10px_rgba(99,102,241,0.5)]',
    },
    input: {
      bg: 'bg-slate-800/80',
      text: 'text-white',
      border: 'border border-slate-700',
      placeholder: 'placeholder-slate-500',
      focus: 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
    },
    button: {
      primary: {
        bg: 'bg-gradient-to-r from-indigo-500 to-sky-500',
        text: 'text-white',
        hover: 'hover:from-indigo-600 hover:to-sky-600',
        shadow: 'shadow-md shadow-indigo-500/30',
      },
      secondary: {
        bg: 'bg-slate-800/50',
        text: 'text-slate-300',
        border: 'border border-slate-700',
        hover: 'hover:bg-slate-700/50',
      },
    },
    states: {
      open: {
        bg: 'bg-emerald-900/20',
        text: 'text-emerald-400',
        glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
      },
      closed: {
        bg: 'bg-slate-700/30',
        text: 'text-slate-400',
      },
    },
    message: {
      sent: {
        bg: 'bg-gradient-to-r from-indigo-600 to-sky-600',
        text: 'text-white',
        shadow: 'shadow-md shadow-indigo-500/20',
      },
      received: {
        bg: 'bg-slate-800/80',
        text: 'text-white',
        border: 'border border-slate-700/50',
        shadow: 'shadow-md',
      },
    },
    special: {
      highlight: 'text-sky-400',
      pulse: 'animate-pulse text-sky-400',
      glow: 'shadow-[0_0_12px_rgba(56,189,248,0.5)]',
      backdrop: 'backdrop-blur-lg bg-slate-900/70',
      overlay: 'bg-gradient-to-br from-slate-900/90 to-indigo-900/40 backdrop-blur-md',
    },
  },
  
  glassmorphism: {
    name: "Glassmorphism",
    container: {
      bg: 'bg-gradient-to-br from-rose-100 via-violet-100 to-teal-100',
    },
    card: {
      bg: 'bg-white/40 backdrop-blur-xl',
      text: 'text-neutral-800',
      border: 'border border-white/50',
      shadow: 'shadow-xl shadow-neutral-500/10',
    },
    accent: {
      gradient: 'from-violet-600 to-indigo-600',
      text: 'text-white',
    },
    input: {
      bg: 'bg-white/30 backdrop-blur-md',
      text: 'text-neutral-800',
      border: 'border border-white/50',
      placeholder: 'placeholder-neutral-500',
      focus: 'focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
    },
    button: {
      primary: {
        bg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
        text: 'text-white',
        hover: 'hover:from-violet-700 hover:to-indigo-700',
        shadow: 'shadow-lg shadow-violet-500/30',
      },
      secondary: {
        bg: 'bg-white/30 backdrop-blur-md',
        text: 'text-neutral-800',
        border: 'border border-white/50',
        hover: 'hover:bg-white/40',
      },
    },
    states: {
      open: {
        bg: 'bg-green-500/20 backdrop-blur-sm',
        text: 'text-green-800',
      },
      closed: {
        bg: 'bg-rose-500/20 backdrop-blur-sm',
        text: 'text-rose-800',
      },
    },
    message: {
      sent: {
        bg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
        text: 'text-white',
        shadow: 'shadow-lg shadow-violet-500/20',
      },
      received: {
        bg: 'bg-white/50 backdrop-blur-md',
        text: 'text-neutral-800',
        border: 'border border-white/50',
        shadow: 'shadow-lg shadow-neutral-200/30',
      },
    },
    special: {
      highlight: 'text-violet-700',
      pulse: 'animate-pulse text-indigo-600',
      glow: 'shadow-[0_0_15px_rgba(124,58,237,0.5)]',
      backdrop: 'backdrop-blur-xl bg-white/30',
      overlay: 'bg-white/70 backdrop-blur-xl',
    },
  },
  
  neon: {
    name: "Neon",
    container: {
      bg: 'bg-black',
      pattern: 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0.5px,transparent_1px)] bg-[length:24px_24px]',
    },
    card: {
      bg: 'bg-neutral-900',
      text: 'text-white',
      border: 'border border-neutral-800',
      shadow: 'shadow-xl',
    },
    accent: {
      gradient: 'from-lime-400 to-emerald-400',
      text: 'text-black',
      shadow: 'shadow-[0_0_20px_rgba(163,230,53,0.7)]',
    },
    input: {
      bg: 'bg-neutral-900',
      text: 'text-lime-400',
      border: 'border border-neutral-700',
      placeholder: 'placeholder-neutral-600',
      focus: 'focus:border-lime-500 focus:ring-1 focus:ring-lime-500',
    },
    button: {
      primary: {
        bg: 'bg-lime-400',
        text: 'text-black font-medium',
        hover: 'hover:bg-lime-300',
        shadow: 'shadow-[0_0_15px_rgba(163,230,53,0.5)]',
      },
      secondary: {
        bg: 'bg-transparent',
        text: 'text-lime-400',
        border: 'border border-lime-700',
        hover: 'hover:border-lime-500',
      },
    },
    states: {
      open: {
        bg: 'bg-transparent',
        text: 'text-lime-400',
        glow: 'shadow-[0_0_10px_rgba(163,230,53,0.7)]',
      },
      closed: {
        bg: 'bg-transparent',
        text: 'text-red-400',
      },
    },
    message: {
      sent: {
        bg: 'bg-lime-500',
        text: 'text-black',
        shadow: 'shadow-[0_0_15px_rgba(132,204,22,0.5)]',
      },
      received: {
        bg: 'bg-neutral-800',
        text: 'text-white',
        border: 'border border-neutral-700',
      },
    },
    special: {
      highlight: 'text-lime-400',
      pulse: 'animate-pulse text-lime-300',
      glow: 'shadow-[0_0_20px_rgba(163,230,53,0.7)]',
      backdrop: 'backdrop-blur-lg bg-black/70',
      overlay: 'bg-black/80 backdrop-blur-md',
    },
  },
};

export function getThemeConfig(theme: ThemeType = 'cyberpunk'): ThemeConfig {
  return themes[theme] || themes.cyberpunk;
}

export const allThemes = Object.keys(themes).map(key => {
  const theme = themes[key as ThemeType];
  return {
    id: key,
    name: theme.name
  };
});