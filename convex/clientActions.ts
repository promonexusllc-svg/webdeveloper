/**
 * Client Actions — Server-side actions for onboarding & invoice delivery.
 *
 * These are internal actions called from mutations via ctx.scheduler.runAfter.
 */
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

/* ═══════════════════ Email Helpers ═══════════════════ */

async function sendCustomEmail({
  email,
  subject,
  htmlContent,
  textContent,
}: {
  email: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const apiUrl = process.env.VIKTOR_SPACES_API_URL;
  const projectName = process.env.VIKTOR_SPACES_PROJECT_NAME;
  const projectSecret = process.env.VIKTOR_SPACES_PROJECT_SECRET;

  if (!apiUrl || !projectName || !projectSecret) {
    throw new Error("Viktor Spaces environment variables not configured");
  }

  const response = await fetch(`${apiUrl}/api/viktor-spaces/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: projectName,
      project_secret: projectSecret,
      to_email: email,
      subject,
      html_content: htmlContent,
      text_content: textContent,
      email_type: "transactional",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  const result = (await response.json()) as { success: boolean; error?: string };
  if (!result.success) {
    throw new Error(`Email sending failed: ${result.error}`);
  }
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/* ═══════════════════ Client Onboarding ═══════════════════ */

/**
 * Sends a welcome email to a newly created client.
 * The client uses the "Forgot password?" flow on the login page to set
 * their password for the first time (their account is created when
 * they complete the password-reset verification).
 */
export const onboardClient = internalAction({
  args: {
    clientDbId: v.string(),
    clientId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (_ctx, { clientId, name, email }) => {
    const portalUrl = "https://promonexusllc.com/login";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #020817; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1628, #0f2847); padding: 40px 30px; text-align: center; border-bottom: 1px solid #1e293b;">
          <h1 style="color: #00b4ff; font-size: 28px; margin: 0 0 8px 0;">PromoNexus LLC</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Web Development for Commercial Businesses</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #ffffff; margin: 0 0 16px 0;">Welcome, ${name}!</h2>
          <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 8px 0;">
            Your client portal account has been created. Your Client ID is:
          </p>
          <div style="background: #0a1628; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #00b4ff; letter-spacing: 4px; font-family: monospace;">${clientId}</span>
          </div>
          <p style="color: #94a3b8; line-height: 1.6;">
            Through your portal you can:
          </p>
          <ul style="color: #94a3b8; line-height: 2; padding-left: 20px;">
            <li>View and download invoices</li>
            <li>Track your project progress</li>
            <li>Submit support tickets</li>
            <li>Communicate with our team</li>
          </ul>
          <p style="color: #94a3b8; line-height: 1.6; margin: 20px 0 16px 0;">
            To get started, visit the link below and click <strong style="color: #ffffff;">"Forgot password?"</strong> to set your password using your email on file.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${portalUrl}" style="display: inline-block; background: #00b4ff; color: #020817; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
              Access Your Portal
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Your email: ${email}
          </p>
        </div>
        <div style="background: #0a1628; padding: 20px 30px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #475569; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} PromoNexus LLC &mdash; All rights reserved
          </p>
        </div>
      </div>
    `;

    const textContent = [
      `Welcome to PromoNexus LLC, ${name}!`,
      ``,
      `Your Client ID: ${clientId}`,
      ``,
      `Your client portal account has been created. You can:`,
      `- View and download invoices`,
      `- Track project progress`,
      `- Submit support tickets`,
      `- Communicate with our team`,
      ``,
      `To get started, visit ${portalUrl} and click "Forgot password?" to set your password using your email: ${email}`,
      ``,
      `© ${new Date().getFullYear()} PromoNexus LLC`,
    ].join("\n");

    await sendCustomEmail({
      email,
      subject: `Welcome to PromoNexus — Your Client Portal (${clientId})`,
      htmlContent,
      textContent,
    });

    return { success: true };
  },
});

/** Internal mutation to link a user ID to a client record */
export const linkClientToUser = internalMutation({
  args: {
    clientDbId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { clientDbId, userId }) => {
    // Try to find the client doc by its _id
    try {
      const client = await ctx.db.get(clientDbId as any);
      if (client) {
        await ctx.db.patch(client._id, { userId: userId as any });
      }
    } catch {
      // Silently ignore if the ID is invalid
    }
  },
});

/* ═══════════════════ Send Invoice to Client ═══════════════════ */

/**
 * Sends an invoice email to the client. The email includes a beautifully
 * formatted invoice with line items, totals, and payment method info.
 */
export const sendInvoiceEmail = internalAction({
  args: {
    invoiceId: v.id("invoices"),
  },
  handler: async (ctx, { invoiceId }) => {
    const data = await ctx.runQuery(internal.clientActions.getInvoiceData, {
      invoiceId,
    });
    if (!data) throw new Error("Invoice not found");
    if (!data.clientEmail) throw new Error("Client not found for this invoice");

    const lineItemsHtml = data.lineItems
      .map(
        (item: { description: string; quantity: number; unitPrice: number; total: number }) => `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 12px 16px; color: #cbd5e1;">${item.description}</td>
        <td style="padding: 12px 16px; color: #94a3b8; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 16px; color: #94a3b8; text-align: right; font-family: monospace;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px 16px; color: #ffffff; text-align: right; font-family: monospace;">${formatCurrency(item.total)}</td>
      </tr>`,
      )
      .join("");

    const portalUrl = "https://promonexusllc.com/login";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 650px; margin: 0 auto; background: #020817; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1628, #0f2847); padding: 40px 30px; border-bottom: 1px solid #1e293b;">
          <table style="width: 100%;"><tr>
            <td>
              <h1 style="color: #00b4ff; font-size: 24px; margin: 0;">PromoNexus LLC</h1>
              <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Web Development for Commercial Businesses</p>
            </td>
            <td style="text-align: right;">
              <div style="font-size: 28px; font-weight: bold; color: #ffffff; font-family: monospace;">${data.quoteNumber}</div>
              <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Issued: ${data.issueDate}</div>
              ${data.dueDate ? `<div style="color: #f59e0b; font-size: 12px;">Due: ${data.dueDate}</div>` : ""}
            </td>
          </tr></table>
        </div>

        <div style="padding: 30px;">
          <div style="margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Bill To</p>
            <p style="color: #ffffff; font-weight: 600; margin: 0;">${data.clientName}</p>
            ${data.clientCompany ? `<p style="color: #94a3b8; margin: 2px 0;">${data.clientCompany}</p>` : ""}
            <p style="color: #94a3b8; margin: 2px 0;">${data.clientEmail}</p>
            <p style="color: #00b4ff; font-family: monospace; margin: 4px 0 0 0;">${data.clientId}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #0a1628;">
                <th style="padding: 12px 16px; color: #64748b; text-align: left; font-weight: 500; font-size: 13px;">Description</th>
                <th style="padding: 12px 16px; color: #64748b; text-align: center; font-weight: 500; font-size: 13px;">Qty</th>
                <th style="padding: 12px 16px; color: #64748b; text-align: right; font-weight: 500; font-size: 13px;">Unit Price</th>
                <th style="padding: 12px 16px; color: #64748b; text-align: right; font-weight: 500; font-size: 13px;">Total</th>
              </tr>
            </thead>
            <tbody>${lineItemsHtml}</tbody>
          </table>

          <div style="margin-top: 16px; margin-left: auto; width: 250px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Subtotal</td>
                <td style="padding: 6px 0; color: #cbd5e1; text-align: right; font-family: monospace;">${formatCurrency(data.subtotal)}</td>
              </tr>
              ${data.taxRate && data.taxAmount ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Tax (${data.taxRate}%)</td>
                <td style="padding: 6px 0; color: #cbd5e1; text-align: right; font-family: monospace;">${formatCurrency(data.taxAmount)}</td>
              </tr>` : ""}
              <tr style="border-top: 1px solid #1e293b;">
                <td style="padding: 12px 0 6px 0; color: #ffffff; font-size: 18px; font-weight: bold;">Total</td>
                <td style="padding: 12px 0 6px 0; color: #00b4ff; text-align: right; font-family: monospace; font-size: 18px; font-weight: bold;">${formatCurrency(data.total)}</td>
              </tr>
            </table>
          </div>

          ${data.notes ? `
          <div style="background: #0a1628; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">Notes</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 0; white-space: pre-wrap;">${data.notes}</p>
          </div>` : ""}

          <div style="background: #0a1628; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Payment Methods</p>
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="padding: 4px 0; color: #94a3b8;">CashApp</td><td style="padding: 4px 0; color: #ffffff; text-align: right;">$promonexuswebdesign</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">PayPal</td><td style="padding: 4px 0; color: #ffffff; text-align: right;">@EricTomchik</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">Venmo</td><td style="padding: 4px 0; color: #ffffff; text-align: right;">@PromoNexusLLC</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">Zelle</td><td style="padding: 4px 0; color: #ffffff; text-align: right;">(228) 344-5724</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">Apple Cash</td><td style="padding: 4px 0; color: #ffffff; text-align: right;">(228) 344-5724</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="${portalUrl}" style="display: inline-block; background: #00b4ff; color: #020817; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
              View in Portal
            </a>
          </div>
        </div>

        <div style="background: #0a1628; padding: 20px 30px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #475569; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} PromoNexus LLC &mdash; All rights reserved
          </p>
        </div>
      </div>
    `;

    const lineItemsText = data.lineItems
      .map((item: { description: string; quantity: number; unitPrice: number; total: number }) =>
        `  ${item.description} — ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`,
      )
      .join("\n");

    const textContent = [
      `INVOICE ${data.quoteNumber}`,
      ``,
      `Bill To: ${data.clientName} (${data.clientId})`,
      data.clientCompany ? `Company: ${data.clientCompany}` : null,
      `Email: ${data.clientEmail}`,
      ``,
      `Issued: ${data.issueDate}`,
      data.dueDate ? `Due: ${data.dueDate}` : null,
      ``,
      `Line Items:`,
      lineItemsText,
      ``,
      `Subtotal: ${formatCurrency(data.subtotal)}`,
      data.taxRate ? `Tax (${data.taxRate}%): ${formatCurrency(data.taxAmount ?? 0)}` : null,
      `TOTAL: ${formatCurrency(data.total)}`,
      data.notes ? `\nNotes: ${data.notes}` : null,
      ``,
      `Payment Methods:`,
      `  CashApp: $promonexuswebdesign`,
      `  PayPal: @EricTomchik`,
      `  Venmo: @PromoNexusLLC`,
      `  Zelle: (228) 344-5724`,
      `  Apple Cash: (228) 344-5724`,
      ``,
      `View in your portal: ${portalUrl}`,
      ``,
      `© ${new Date().getFullYear()} PromoNexus LLC`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    await sendCustomEmail({
      email: data.clientEmail,
      subject: `Invoice ${data.quoteNumber} — ${formatCurrency(data.total)} — PromoNexus LLC`,
      htmlContent,
      textContent,
    });

    return { success: true };
  },
});

/** Internal query to fetch invoice + client data for email rendering */
export const getInvoiceData = internalQuery({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, { invoiceId }) => {
    const invoice = await ctx.db.get(invoiceId);
    if (!invoice) return null;

    // Find the client
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_clientId", (q) => q.eq("clientId", invoice.clientId))
      .collect();
    const client = clients[0] ?? null;

    return {
      quoteNumber: invoice.quoteNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate ?? null,
      notes: invoice.notes ?? null,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate ?? null,
      taxAmount: invoice.taxAmount ?? null,
      total: invoice.total,
      lineItems: invoice.lineItems,
      clientId: invoice.clientId,
      clientName: client?.name ?? "Client",
      clientEmail: client?.email ?? null,
      clientCompany: client?.company ?? null,
    };
  },
});
