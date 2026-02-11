import type { AllScreenType } from '../types/screenAssistantConfig';

type NavigationHandler = (screen: AllScreenType) => void;
type ActionHandler = (params?: Record<string, any>) => void | Promise<void>;

interface RegisteredAction {
  handler: ActionHandler;
  description: string;
}

class ActionRegistry {
  private navigationHandler: NavigationHandler | null = null;
  private actions: Map<string, RegisteredAction> = new Map();

  registerNavigationHandler(handler: NavigationHandler) {
    this.navigationHandler = handler;
  }

  registerAction(id: string, handler: ActionHandler, description: string) {
    this.actions.set(id, { handler, description });
  }

  unregisterAction(id: string) {
    this.actions.delete(id);
  }

  clearActions() {
    this.actions.clear();
  }

  navigateTo(screen: AllScreenType): { success: boolean; message: string } {
    if (!this.navigationHandler) {
      return { success: false, message: 'Navigation not available' };
    }
    try {
      this.navigationHandler(screen);
      return { success: true, message: `Navigated to ${screen}` };
    } catch (err) {
      return { success: false, message: `Navigation failed: ${err}` };
    }
  }

  async executeAction(id: string, params?: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const action = this.actions.get(id);
    if (!action) {
      return { success: false, message: `Action "${id}" not registered` };
    }
    try {
      await action.handler(params);
      return { success: true, message: `Executed action: ${action.description}` };
    } catch (err) {
      return { success: false, message: `Action failed: ${err}` };
    }
  }

  getRegisteredActions(): { id: string; description: string }[] {
    return Array.from(this.actions.entries()).map(([id, action]) => ({
      id,
      description: action.description,
    }));
  }
}

export const actionRegistry = new ActionRegistry();
