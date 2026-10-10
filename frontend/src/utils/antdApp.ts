import React, { useEffect } from 'react';
import { App } from 'antd';
import type { MessageInstance, ArgsProps } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type {
  NotificationInstance,
  ArgsProps as NotificationArgsProps,
} from 'antd/es/notification/interface';

let messageInstance: MessageInstance | null = null;
let notificationInstance: NotificationInstance | null = null;
let modalInstance: Omit<ModalStaticFunctions, 'warn'> | null = null;

export const AntdAppBridge: React.FC = () => {
  const staticFunction = App.useApp();
  useEffect(() => {
    messageInstance = staticFunction.message;
    notificationInstance = staticFunction.notification;
    modalInstance = staticFunction.modal;
  }, [staticFunction]);
  return null;
};

export const message = {
  info: (content: ArgsProps | string, duration?: number, onClose?: () => void) =>
    messageInstance?.info(content as unknown as string, duration, onClose),
  success: (content: ArgsProps | string, duration?: number, onClose?: () => void) =>
    messageInstance?.success(content as unknown as string, duration, onClose),
  error: (content: ArgsProps | string, duration?: number, onClose?: () => void) =>
    messageInstance?.error(content as unknown as string, duration, onClose),
  warning: (content: ArgsProps | string, duration?: number, onClose?: () => void) =>
    messageInstance?.warning(content as unknown as string, duration, onClose),
  warn: (content: ArgsProps | string, duration?: number, onClose?: () => void) =>
    messageInstance?.warning(content as unknown as string, duration, onClose),
  loading: (content: ArgsProps | string, duration?: number, onClose?: () => void) =>
    messageInstance?.loading(content as unknown as string, duration, onClose),
  open: (args: ArgsProps) => messageInstance?.open(args),
  destroy: (key?: React.Key) => messageInstance?.destroy(key),
};

export const notification = {
  success: (args: NotificationArgsProps) => notificationInstance?.success(args),
  error: (args: NotificationArgsProps) => notificationInstance?.error(args),
  info: (args: NotificationArgsProps) => notificationInstance?.info(args),
  warning: (args: NotificationArgsProps) => notificationInstance?.warning(args),
  open: (args: NotificationArgsProps) => notificationInstance?.open(args),
  destroy: (key?: React.Key) => notificationInstance?.destroy(key),
};

export { messageInstance, notificationInstance, modalInstance };
