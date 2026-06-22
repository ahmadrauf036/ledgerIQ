
interface Props {
    title: string;
    subtitle: string;
    rightContent?: React.ReactNode;
}

export default function ReportHeader({
    title,
    subtitle,
    rightContent,
}: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100">
                        {title}
                    </h1>
                    <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
                </div>
                {rightContent}
            </div>
           
        </div>
    );
}
