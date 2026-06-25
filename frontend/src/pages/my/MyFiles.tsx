import { useAuthStore } from "../../modules/auth/auth.store";
import FilesPage from "../../pages/files/Files"; // we'll make it accept an optional fixed companyId

// Simplest approach: reuse the existing FilesPage logic but lock company
// Since Files.tsx reads companyId from URL searchParams, easiest fix
// is a thin wrapper that injects the session's companyId into the URL.

import { useEffect } from "react";
import {  useSearchParams } from "react-router-dom";

export default function MyFilesPage() {
    const { companyId } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (companyId && searchParams.get("company") !== companyId) {
            setSearchParams({ company: companyId }, { replace: true });
        }
    }, [companyId, searchParams, setSearchParams]);

    if (!companyId) return null;

    return <FilesPage hideCompanySwitcher />;
}
