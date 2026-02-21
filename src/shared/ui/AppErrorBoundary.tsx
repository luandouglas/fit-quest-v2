import { Component, type ErrorInfo, type ReactNode } from 'react'

import { IonButton, IonText } from '@ionic/react'

import { PageContainer } from './PageContainer'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  error: Error | null
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AppErrorBoundary] runtime error', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <PageContainer centered>
        <IonText color="danger">
          <h2>Algo deu errado.</h2>
        </IonText>
        <IonText color="medium">Tente recarregar para continuar.</IonText>
        <IonButton onClick={this.handleReload}>Recarregar app</IonButton>
      </PageContainer>
    )
  }
}
