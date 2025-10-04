import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { format } from 'https://esm.sh/date-fns@3.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionAmount {
  amount: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all active budgets
    const { data: budgets, error: budgetsError } = await supabaseAdmin
      .from('budgets')
      .select(`
        id,
        user_id,
        name,
        amount,
        start_date,
        end_date,
        category_id,
        profiles (
          first_name
        )
      `)
      .gte('end_date', format(new Date(), 'yyyy-MM-dd')); // Only active budgets

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch budgets' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    for (const budget of budgets) {
      const userId = budget.user_id;
      const budgetName = budget.name;
      const budgetAmount = budget.amount;
      const budgetStartDate = budget.start_date;
      const budgetEndDate = budget.end_date;
      const budgetCategoryId = budget.category_id;
      const userFirstName = budget.profiles?.first_name || 'User';

      // Calculate spent amount for the current budget period
      let transactionsQuery = supabaseAdmin
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense') // Budgets are typically for expenses
        .gte('date', budgetStartDate)
        .lte('date', budgetEndDate);

      if (budgetCategoryId) {
        transactionsQuery = transactionsQuery.eq('category_id', budgetCategoryId);
      }

      const { data: transactions, error: transactionsError } = await transactionsQuery;

      if (transactionsError) {
        console.error(`Error fetching transactions for budget ${budget.id}:`, transactionsError);
        continue; // Skip to the next budget
      }

      const spentAmount = (transactions as TransactionAmount[]).reduce((sum: number, t: TransactionAmount) => sum + t.amount, 0);
      const percentageSpent = (spentAmount / budgetAmount) * 100;

      let notificationTitle = '';
      let notificationBody = '';
      let shouldNotify = false;

      // Define thresholds for notifications
      const OVER_BUDGET_THRESHOLD = 100;
      const NEAR_LIMIT_THRESHOLD = 80; // Notify when 80% or more is spent

      if (percentageSpent >= OVER_BUDGET_THRESHOLD) {
        notificationTitle = `Budget Alert: ${budgetName} Overspent!`;
        notificationBody = `Hi ${userFirstName}, you've spent ₹${spentAmount.toFixed(2)} out of your ₹${budgetAmount.toFixed(2)} budget for ${budgetName}. You are over budget by ₹${(spentAmount - budgetAmount).toFixed(2)}!`;
        shouldNotify = true;
      } else if (percentageSpent >= NEAR_LIMIT_THRESHOLD) {
        notificationTitle = `Budget Warning: ${budgetName} Nearing Limit!`;
        notificationBody = `Hi ${userFirstName}, you've spent ₹${spentAmount.toFixed(2)} out of your ₹${budgetAmount.toFixed(2)} budget for ${budgetName}. You have ₹${(budgetAmount - spentAmount).toFixed(2)} remaining.`;
        shouldNotify = true;
      }

      if (shouldNotify) {
        // Fetch user's push subscription
        const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('subscription_data')
          .eq('user_id', userId);

        if (subscriptionsError) {
          console.error(`Error fetching subscriptions for user ${userId}:`, subscriptionsError);
          continue;
        }

        if (subscriptions && subscriptions.length > 0) {
          const userSubscription = subscriptions[0].subscription_data; // Assuming one subscription per user for simplicity

          // Invoke the send-notification Edge Function
          const { data: notificationResponse, error: notificationError } = await supabaseAdmin.functions.invoke('send-notification', {
            body: {
              subscription: userSubscription,
              payload: {
                title: notificationTitle,
                body: notificationBody,
                icon: '/placeholder.svg',
                url: '/budgets', // Link to the budgets page
              },
            },
          });

          if (notificationError) {
            console.error(`Error invoking send-notification for user ${userId}:`, notificationError);
          } else {
            console.log(`Budget notification sent for user ${userId}, budget ${budgetName}:`, notificationResponse);
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Budget check completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in check-budgets function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});