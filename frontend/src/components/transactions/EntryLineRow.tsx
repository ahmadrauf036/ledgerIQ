
import { X } from "lucide-react"
import type { Account } from "../../modules/accounts/accounts.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface LineValue {
    account_id: string
    debit: number
    credit: number
    description?: string
}

interface Props {
    line: LineValue
    index: number
    accounts: Account[]
    onChange: (index: number, line: LineValue) => void
    onRemove: (index: number) => void
    canRemove: boolean
}

export default function EntryLineRow({
    line,
    index,
    accounts,
    onChange,
    onRemove,
    canRemove,
}: Props) {
    const handleAccountChange = (accountId: string) => {
        onChange(index, { ...line, account_id: accountId })
    }

    const handleDebitChange = (value: string) => {
        const num = parseFloat(value) || 0
        onChange(index, { ...line, debit: num, credit: num > 0 ? 0 : line.credit })
    }

    const handleCreditChange = (value: string) => {
        const num = parseFloat(value) || 0
        onChange(index, { ...line, credit: num, debit: num > 0 ? 0 : line.debit })
    }

    return (
        <div className="grid grid-cols-[1fr_120px_120px_32px] gap-2 items-start">
            {/* Account select */}
            <Select
                value={line.account_id}
                onValueChange={handleAccountChange}
            >
                <SelectTrigger className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm">
                    <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-zinc-100 max-h-64">
                    {accounts.map((acc) => (
                        <SelectItem
                            key={acc.id}
                            value={acc.id}
                            className="text-zinc-100 focus:bg-zinc-700 text-sm"
                        >
                            {acc.code} — {acc.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Debit */}
            <Input
                type="number"
                placeholder="0"
                value={line.debit || ""}
                onChange={(e) => handleDebitChange(e.target.value)}
                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm text-right"
            />

            {/* Credit */}
            <Input
                type="number"
                placeholder="0"
                value={line.credit || ""}
                onChange={(e) => handleCreditChange(e.target.value)}
                className="bg-zinc-800 border-white/10 text-zinc-100 h-9 text-sm text-right"
            />

            {/* Remove */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canRemove}
                onClick={() => onRemove(index)}
                className="h-9 w-9 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
            >
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
}