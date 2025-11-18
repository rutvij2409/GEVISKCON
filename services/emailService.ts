import { InventoryItem } from '../types';

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface LowStockAlertParams {
  recipientEmail: string;
  threshold: number;
  item: InventoryItem;
  newQuantity: number;
}

export const sendLowStockAlert = async (
  emailConfig: EmailJsConfig,
  alertParams: LowStockAlertParams
): Promise<{ success: boolean; message: string }> => {
  const { serviceId, templateId, publicKey } = emailConfig;
  const { recipientEmail, threshold, item, newQuantity } = alertParams;

  if (!serviceId || !templateId || !publicKey || !recipientEmail) {
    return { success: false, message: 'Email configuration is incomplete.' };
  }

  const data = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      recipient_email: recipientEmail,
      item_name: item.name,
      item_sku: item.sku,
      new_quantity: newQuantity,
      threshold: threshold,
    },
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, message: `Low stock alert for ${item.name} sent.` };
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to send email.');
    }
  } catch (error) {
    console.error('EmailJS request failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Email failed: ${errorMessage}` };
  }
};
