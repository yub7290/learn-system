/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'uview-plus' {
  import type { Plugin } from 'vue'
  const plugin: Plugin
  export default plugin
}

declare module 'sm-crypto' {
  export function sm2(...args: any[]): any
  export function sm3(message: string | number[]): string
  export function sm4(...args: any[]): any
}
