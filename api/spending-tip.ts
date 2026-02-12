type Handler = (req: any, res: any) => any;

export default (async function handler(req: any, res: any) {
  const mod: any = await import('./spending-tip.js');
  const fn: Handler = mod?.default || mod;
  return fn(req, res);
} satisfies Handler);
