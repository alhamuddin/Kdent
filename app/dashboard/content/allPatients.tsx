"use client";

import { useMemo, useState } from "react";
import {
  columnFacetingFeature,
  columnFilteringFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowSortingFeature,
  rowPaginationFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { Column, ColumnDef, PaginationState } from "@tanstack/react-table";
import { patientsData } from "../../data";

type Patient = (typeof patientsData)[number];

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnFilteringFeature,
  columnFacetingFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

const columns: ColumnDef<typeof features, Patient>[] = [
  {
    id: "patient",
    accessorFn: (patient) => `${patient.first_name} ${patient.last_name}`,
    header: "Patient",
    filterFn: "includesString",
    sortFn: "alphanumeric",
    cell: ({ getValue, row }) => (
      <div>
        <div className="font-medium text-white">{getValue<string>()}</div>
        <div className="text-xs text-white/60">Patient #{row.original.id}</div>
      </div>
    ),
  },
  { accessorKey: "age", header: "Age", sortFn: "basic" },
  { accessorKey: "gender", header: "Gender", filterFn: "includesString" },
  { accessorKey: "blood_type", header: "Blood type" },
  { accessorKey: "phone_number", header: "Phone", enableSorting: false },
  { accessorKey: "visit_date", header: "Last visit", sortFn: "alphanumeric" },
  {
    accessorKey: "admission_status",
    header: "Status",
    filterFn: "includesString",
    cell: ({ getValue }) => {
      const status = getValue<string>();
      const styles: Record<string, string> = {
        Stable: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        Discharged: "bg-slate-100 text-slate-700 ring-slate-600/20",
        "Under Observation": "bg-amber-50 text-amber-700 ring-amber-600/20",
        Critical: "bg-rose-50 text-rose-700 ring-rose-600/20",
      };
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] ?? "bg-slate-100 text-slate-700 ring-slate-600/20"}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    filterFn: "includesString",
    cell: ({ getValue }) => (
      <span className="block max-w-64 truncate" title={getValue<string>()}>
        {getValue<string>()}
      </span>
    ),
  },
];

function FilterInput({
  column,
  placeholder,
}: {
  column: Column<typeof features, Patient>;
  placeholder: string;
}) {
  return (
    <input
      aria-label={placeholder}
      className="bg-background text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-md border border-white/15 px-3 py-2 text-xs transition outline-none placeholder:text-white/45 focus:ring-2 sm:text-sm"
      placeholder={placeholder}
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        column.setFilterValue(event.target.value || undefined)
      }
    />
  );
}

function FacetSelect({
  column,
  label,
}: {
  column: Column<typeof features, Patient>;
  label: string;
}) {
  const options = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort() as string[],
    [column],
  );

  return (
    <select
      aria-label={`Filter by ${label}`}
      className="bg-background text-foreground focus:border-primary focus:ring-primary/20 rounded-md border border-white/15 px-3 py-2 text-xs outline-none focus:ring-2 sm:text-sm"
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        column.setFilterValue(event.target.value || undefined)
      }
    >
      <option value="">All {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function AllPatients() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const table = useTable({
    features,
    columns,
    data: patientsData,
    state: { pagination },
    onPaginationChange: setPagination,
  });
  const patientColumn = table.getColumn("patient")!;
  const genderColumn = table.getColumn("gender")!;
  const statusColumn = table.getColumn("admission_status")!;
  const diagnosisColumn = table.getColumn("diagnosis")!;

  return (
    <section className="bg-secondary/60 flex h-auto min-h-0 w-full flex-col gap-3 rounded-xl p-3 text-white sm:gap-4 sm:p-4 lg:h-full">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            All patients
          </h1>
          <p className="mt-1 text-xs text-white/70 sm:text-sm">
            Browse, sort, and filter the patient directory.
          </p>
        </div>
        <p className="text-xs text-white/70 sm:text-sm">
          Showing{" "}
          <span className="font-semibold text-white">
            {Math.min(table.getRowCount(), pagination.pageSize)}
          </span>{" "}
          of {table.getRowCount()} matching patients
        </p>
      </div>

      <div className="bg-secondary/80 flex flex-col gap-2 rounded-xl border border-white/10 p-3 md:flex-row md:flex-wrap md:items-center">
        <div className="min-w-52 flex-1">
          <FilterInput
            column={patientColumn}
            placeholder="Search patient name..."
          />
        </div>
        <div className="min-w-52 flex-1">
          <FilterInput
            column={diagnosisColumn}
            placeholder="Search diagnosis..."
          />
        </div>
        <FacetSelect column={genderColumn} label="genders" />
        <FacetSelect column={statusColumn} label="statuses" />
        <button
          className="rounded-md px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:text-sm"
          onClick={() => table.resetColumnFilters()}
          type="button"
        >
          Clear filters
        </button>
      </div>

      <div className="bg-background/70 flex min-h-0 flex-none flex-col overflow-visible rounded-xl border border-white/10 shadow-sm lg:flex-1 lg:overflow-hidden">
        <div className="overflow-x-auto lg:min-h-0 lg:flex-1 lg:overflow-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead className="bg-background sticky top-0 z-10 text-[10px] tracking-wide text-white uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th className="border-b border-white/10 px-3 py-2 font-semibold whitespace-nowrap">
                    SL
                  </th>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="border-b border-white/10 px-3 py-2 font-semibold whitespace-nowrap"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="hover:text-primary inline-flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          <table.FlexRender header={header} />
                          <span aria-hidden="true" className="text-primary">
                            {{ asc: "↑", desc: "↓" }[
                              header.column.getIsSorted() as string
                            ] ?? "↕"}
                          </span>
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-secondary/50 divide-y divide-white/10 text-white">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <tr className="transition hover:bg-white/5" key={row.id}>
                    <td className="px-3 py-1.5 whitespace-nowrap text-white/70">
                      {pagination.pageIndex * pagination.pageSize +
                        rowIndex +
                        1}
                    </td>
                    {row.getAllCells().map((cell) => (
                      <td
                        className="px-3 py-1.5 whitespace-nowrap text-white"
                        key={cell.id}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-white/70"
                    colSpan={columns.length + 1}
                  >
                    No patients match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-secondary/80 flex flex-col gap-2 border-t border-white/10 px-3 py-2 text-xs text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {table.getRowCount() === 0
              ? "No patients"
              : `Showing ${pagination.pageIndex * pagination.pageSize + 1}–${Math.min((pagination.pageIndex + 1) * pagination.pageSize, table.getRowCount())} of ${table.getRowCount()} patients`}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded border border-white/20 px-2.5 py-1.5 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
            >
              Previous
            </button>
            <span className="min-w-16 text-center">
              Page {pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </span>
            <button
              className="rounded border border-white/20 px-2.5 py-1.5 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
