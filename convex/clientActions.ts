/**
 * Client Actions — Server-side actions for onboarding & invoice delivery.
 *
 * These are internal actions called from mutations via ctx.scheduler.runAfter.
 */
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Scrypt } from "lucia";
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
 * Creates a portal user account for a new client and sends a welcome email.
 * The account is created with a random temporary password — the client
 * must use "Forgot password?" to set their own password.
 */
export const onboardClient = internalAction({
  args: {
    clientDbId: v.string(), // The Convex _id of the client record
    clientId: v.string(),   // PN-XXXX
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { clientDbId, clientId, name, email }) => {
    // Generate a random temporary password (client will never see this)
    const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

    // Check if account already exists
    let userId: string | undefined;
    try {
      const existing = await retrieveAccount(ctx, {
        provider: "password",
        account: { id: email.toLowerCase() },
      });
      userId = existing.user._id as string;
    } catch {
      // Account doesn't exist — create it
      const hashedPassword = await new Scrypt().hash(tempPassword);
      const result = await createAccount(ctx, {
        provider: "password",
        account: {
          id: email.toLowerCase(),
          secret: hashedPassword,
        },
        profile: {
          email: email.toLowerCase(),
          name,
          emailVerificationTime: Date.now(),
        },
        shouldLinkViaEmail: false,
      });
      userId = result.user._id as string;
    }

    // Link user to client record
    if (userId) {
      await ctx.runMutation(internal.clientActions.linkClientToUser, {
        clientDbId,
        userId,
      });
    }

    // Determine the portal URL
    const portalUrl = "https://promonexusllc.com/login";

    // Send welcome email
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
            To get started, please set your password by clicking the link below and using <strong style="color: #ffffff;">"Forgot password?"</strong> with your email:
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
            © ${new Date().getFullYear()} PromoNexus LLC — All rights reserved
          </p>
        </div>
      </div>
    `;

    const textContent = `Welcome to PromoNexus LLC, ${name}!\n\nYour Client ID: ${clientId}\n\nYour client portal account has been created. You can:\n- View and download invoices\n- Track project progress\n- Submit support tickets\n- Communicate with our team\n\nTo get started, visit ${portalUrl} and click "Forgot password?" to set your password using your email: ${email}\n\n© ${new Date().getFullYear()} PromoNexus LLC`;

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
    const client = await ctx.db.get(clientDbId as any);
    if (client) {
      await ctx.db.patch(client._id, { userId: userId as any });
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
    invoiceId: v.string(),
  },
  handler: async (ctx, { invoiceId }) => {
    // Get invoice and client data
    const invoice = await ctx.runQuery(internal.clientActions.getInvoiceData, {
      invoiceId,
    });
    if (!invoice) throw new Error("Invoice not found");
    if (!invoice.client) throw new Error("Client not found for this invoice");

    const { client } = invoice;

    // Build line items HTML
    const lineItemsHtml = invoice.lineItems
      .map(
        (item: any) => `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 12px 16px; color: #cbd5e1;">${item.description}</td>
        <td style="padding: 12px 16px; color: #94a3b8; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 16px; color: #94a3b8; text-align: right; font-family: monospace;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px 16px; color: #ffffff; text-align: right; font-family: monospace;">${formatCurrency(item.total)}</td>
      </tr>`
      )
      .join("");

    const portalUrl = "https://promonexusllc.com/login";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 650px; margin: 0 auto; background: #020817; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1628, #0f2847); padding: 40px 30px; border-bottom: 1px solid #1e293b;">
          <table style="width: 100%;">
            <tr>
              <td>
                <h1 style="color: #00b4ff; font-size: 24px; margin: 0;">PromoNexus LLC</h1>
                <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Web Development for Commercial Businesses</p>
              </td>
              <td style="text-align: right;">
                <div style="font-size: 28px; font-weight: bold; color: #ffffff; font-family: monospace;">${invoice.quoteNumber}</div>
                <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Issued: ${invoice.issueDate}</div>
                ${invoice.dueDate ? `<div style="color: #f59e0b; font-size: 12px;">Due: ${invoice.dueDate}</div>` : ""}
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 30px;">
          <div style="margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Bill To</p>
            <p style="color: #ffffff; font-weight: 600; margin: 0;">${client.name}</p>
            ${client.company ? `<p style="color: #94a3b8; margin: 2px 0;">${client.company}</p>` : ""}
            <p style="color: #94a3b8; margin: 2px 0;">${client.email}</p>
            <p style="color: #00b4ff; font-family: monospace; margin: 4px 0 0 0;">${client.clientId}</p>
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
            <tbody>
              ${lineItemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 16px; margin-left: auto; width: 250px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Subtotal</td>
                <td style="padding: 6px 0; color: #cbd5e1; text-align: right; font-family: monospace;">${formatCurrency(invoice.subtotal)}</td>
              </tr>
              ${invoice.taxRate && invoice.taxAmount ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Tax (${invoice.taxRate}%)</td>
                <td style="padding: 6px 0; color: #cbd5e1; text-align: right; font-family: monospace;">${formatCurrency(invoice.taxAmount)}</td>
              </tr>` : ""}
              <tr style="border-top: 1px solid #1e293b;">
                <td style="padding: 12px 0 6px 0; color: #ffffff; font-size: 18px; font-weight: bold;">Total</td>
                <td style="padding: 12px 0 6px 0; color: #00b4ff; text-align: right; font-family: monospace; font-size: 18px; font-weight: bold;">${formatCurrency(invoice.total)}</td>
              </tr>
            </table>
          </div>

          ${invoice.notes ? `
          <div style="background: #0a1628; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">Notes</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 0; white-space: pre-wrap;">${invoice.notes}</p>
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
            © ${new Date().getFullYear()} PromoNexus LLC — All rights reserved
          </p>
        </div>
      </div>
    `;

    const lineItemsText = invoice.lineItems
      .map((item: any) => `  ${item.description} — ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`)
      .join("\n");

    const textContent = `INVOICE ${invoice.quoteNumber}\n\nBill To: ${client.name} (${client.clientId})\n${client.company ? `Company: ${client.company}\n` : ""}Email: ${client.email}\n\nIssued: ${invoice.issueDate}${invoice.dueDate ? `\nDue: ${invoice.dueDate}` : ""}\n\nLine Items:\n${lineItemsText}\n\nSubtotal: ${formatCurrency(invoice.subtotal)}${invoice.taxRate ? `\nTax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount ?? 0)}` : ""}\nTOTAL: ${formatCurrency(invoice.total)}\n${invoice.notes ? `\nNotes: ${invoice.notes}\n` : ""}\nPayment Methods:\n  CashApp: $promonexuswebdesign\n  PayPal: @EricTomchik\n  Venmo: @PromoNexusLLC\n  Zelle: (228) 344-5724\n  Apple Cash: (228) 344-5724\n\nView in your portal: ${portalUrl}\n\n© ${new Date().getFullYear()} PromoNexus LLC`;

    await sendCustomEmail({
      email: client.email,
      subject: `Invoice ${invoice.quoteNumber} — ${formatCurrency(invoice.total)} — PromoNexus LLC`,
      htmlContent,
      textContent,
    });

    return { success: true };
  },
});

/** Internal query to fetch invoice + client data for email rendering */
export const getInvoiceData = internalQuery({
  args: { invoiceId: v.string() },
  handler: async (ctx, { invoiceId }) => {
    const invoice = await ctx.db.get(invoiceId as any);
    if (!invoice) return null;
    // Find the client
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_clientId", (q: any) => q.eq("clientId", invoice.clientId))
      .collect();
    const client = clients[0] ?? null;
    return { ...invoice, client };
  },
});
