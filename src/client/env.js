export const NODE_ENV = process.env.NODE_ENV;
export const isProd = NODE_ENV === 'production';
export const isDev = !isProd;