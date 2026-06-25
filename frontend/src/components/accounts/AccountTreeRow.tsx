import { useState } from "react";
import type { Account } from "../../modules/accounts/accounts.types";
import AccountTypeBadge from "./AccountTypeBadge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    Pencil,
    Power,
    Plus,
    BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
    account: Account;
    depth: number;
    readOnly?: boolean; // ← added
    onEdit: (account: Account) => void;
    ledgerBasePath?: string;
    onDeactivate: (account: Account) => void;
    onAddChild: (parentAccount: Account) => void;
}

function formatBalance(balance: number): string {
    const abs = Math.abs(balance);
    const formatted = abs.toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return balance < 0 ? `(${formatted})` : formatted;
}

export default function AccountTreeRow({
    account,
    depth,
    readOnly = false,
    ledgerBasePath = "/transactions/ledger",
    onEdit,
    onDeactivate,
    onAddChild,
}: Props) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = account.children && account.children.length > 0;
    const navigate = useNavigate();
    return (
        <>
            <div
                className={`
                    flex items-center justify-between
                    px-3 py-2 rounded-md
                    hover:bg-white/5
                    border-b border-white/5
                    ${!account.is_active ? "opacity-40" : ""}
                `}
                style={{ paddingLeft: `${12 + depth * 24}px` }}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Expand/collapse toggle */}
                    {hasChildren ? (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-zinc-500 hover:text-zinc-300 shrink-0"
                        >
                            {expanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                            )}
                        </button>
                    ) : (
                        <span className="w-3.5 shrink-0" />
                    )}

                    {/* Code */}
                    <span className="text-xs text-zinc-500 font-mono w-14 shrink-0">
                        {account.code}
                    </span>

                    {/* Name */}
                    <span
                        className={`text-sm truncate ${
                            hasChildren
                                ? "font-medium text-zinc-100"
                                : "text-zinc-300"
                        }`}
                    >
                        {account.name}
                    </span>

                    {/* Inactive badge */}
                    {!account.is_active && (
                        <span className="text-xs text-zinc-600 shrink-0">
                            (inactive)
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Type badge — only show on top level */}
                    {depth === 0 && <AccountTypeBadge type={account.type} />}

                    {/* Balance */}
                    <span className="text-xs text-zinc-400 font-mono w-20 text-right">
                        {account.balance !== 0
                            ? formatBalance(account.balance)
                            : "—"}
                    </span>

                    {/* Actions */}
                    {readOnly ? (
                        // Read-only users (client_owner) — just a ledger view icon, nothing else
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                            onClick={() =>
                                navigate(`/my-ledger?account=${account.id}`)
                            }
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                        </Button>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-zinc-800 border-white/10 text-zinc-100"
                            >
                                <DropdownMenuItem
                                    className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                    onClick={() =>
                                        navigate(
                                            `${ledgerBasePath}?account=${account.id}`,
                                        )
                                    }
                                >
                                    <BookOpen className="h-3.5 w-3.5" />
                                    View ledger
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                    onClick={() => onAddChild(account)}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add sub-account
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="focus:bg-zinc-700 cursor-pointer gap-2 text-xs"
                                    onClick={() => onEdit(account)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </DropdownMenuItem>
                                {account.is_active && (
                                    <DropdownMenuItem
                                        className="focus:bg-red-500/10 text-red-400 cursor-pointer gap-2 text-xs"
                                        onClick={() => onDeactivate(account)}
                                    >
                                        <Power className="h-3.5 w-3.5" />
                                        Deactivate
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Render children recursively */}
            {hasChildren && expanded && (
                <>
                    {account.children.map((child) => (
                        <AccountTreeRow
                            key={child.id}
                            account={child}
                            depth={depth + 1}
                            readOnly={readOnly}
                            onEdit={onEdit}
                            ledgerBasePath={ledgerBasePath}
                            onDeactivate={onDeactivate}
                            onAddChild={onAddChild}
                        />
                    ))}
                </>
            )}
        </>
    );
}
