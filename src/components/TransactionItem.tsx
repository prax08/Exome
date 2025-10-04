"use client";

import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
  Tag,
  Paperclip,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { MobileActionSheet } from "@/components/MobileActionSheet";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string; // ISO date string
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  receipt_url?: string | null;
  vendor?: string | null;
  payment_method?: string | null;
  created_at: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  isMobile: boolean;
  handleEditTransaction: (transaction: Transaction) => void;
  handleDeleteTransaction: (transactionId: string) => void;
  handleSelectTransaction: (id: string, isSelected: boolean) => void;
  isSelected: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = React.memo(
  ({
    transaction,
    isMobile,
    handleEditTransaction,
    handleDeleteTransaction,
    handleSelectTransaction,
    isSelected,
  }) => {
    const Icon = transaction.type === 'income' ? ArrowUpCircle : ArrowDownCircle;
    const amountColorClass = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';

    if (isMobile) {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleSelectTransaction(transaction.id, checked === true)
                  }
                />
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  {transaction.vendor && (
                    <p className="text-xs text-muted-foreground">Vendor: {transaction.vendor}</p>
                  )}
                  {transaction.category_name && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Tag className="h-3 w-3 mr-1" style={{ color: transaction.category_color || undefined }} />
                      <span>{transaction.category_name}</span>
                    </div>
                  )}
                  {transaction.payment_method && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3 mr-1" />
                      <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{format(new Date(transaction.date), 'PPP')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {transaction.receipt_url && (
                  <a href={transaction.receipt_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Paperclip className="h-4 w-4" />
                  </a>
                )}
                <p className={`font-semibold ${amountColorClass}`}>
                  ₹{transaction.amount.toFixed(2)}
                </p>
                <MobileActionSheet title="Transaction Actions" description={`Actions for ${transaction.description}`}>
                  <Button variant="ghost" onClick={() => handleEditTransaction(transaction)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteTransaction(transaction.id)}>Delete</Button>
                </MobileActionSheet>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <TableRow>
          <TableCell>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                handleSelectTransaction(transaction.id, checked === true)
              }
            />
          </TableCell>
          <TableCell>
            <Icon className="h-5 w-5" />
          </TableCell>
          <TableCell className="font-medium">{transaction.description}</TableCell>
          <TableCell>{transaction.vendor || <span className="text-muted-foreground">-</span>}</TableCell>
          <TableCell>
            {transaction.category_name ? (
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2" style={{ color: transaction.category_color || undefined }} />
                <span>{transaction.category_name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </TableCell>
          <TableCell className="capitalize">{transaction.payment_method?.replace('_', ' ') || <span className="text-muted-foreground">-</span>}</TableCell>
          <TableCell>{format(new Date(transaction.date), 'PPP')}</TableCell>
          <TableCell>
            {transaction.receipt_url && (
              <a href={transaction.receipt_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Paperclip className="h-4 w-4" />
              </a>
            )}
          </TableCell>
          <TableCell className={`text-right font-semibold ${amountColorClass}`}>
            ₹{transaction.amount.toFixed(2)}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );
    }
  }
);

TransactionItem.displayName = "TransactionItem";

export { TransactionItem };