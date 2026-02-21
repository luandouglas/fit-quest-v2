declare module 'react-router-dom' {
  import * as React from 'react'

  export interface BrowserRouterProps {
    basename?: string
    children?: React.ReactNode
    forceRefresh?: boolean
    keyLength?: number
  }

  export const BrowserRouter: React.ComponentType<BrowserRouterProps>
  export const Link: React.ComponentType<any>
  export const Redirect: React.ComponentType<any>
  export const Route: React.ComponentType<any>
}
