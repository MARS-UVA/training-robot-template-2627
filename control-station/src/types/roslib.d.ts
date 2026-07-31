declare module 'roslib' {
  export class Ros {
    constructor(options: { url?: string })
    on(event: 'connection' | 'error' | 'close', callback: (event?: unknown) => void): void
    close(): void
  }

  export class Topic<TMessage = unknown> {
    constructor(options: {
      ros: Ros
      name: string
      messageType: string
    })
    subscribe(callback: (message: TMessage) => void): void
    unsubscribe(): void
    publish(message: TMessage): void
  }

  export class Action<TGoal = unknown, TResult = unknown, TFeedback = unknown> {
    constructor(options: {
      ros: Ros
      name: string
      actionType: string
    })
    sendGoal(
      goal: TGoal,
      resultCallback: (result: TResult) => void,
      feedbackCallback?: (feedback: TFeedback) => void,
      failedCallback?: (error: string) => void,
    ): string
    cancelGoal(id: string): void
  }
}
