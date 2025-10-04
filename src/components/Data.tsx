import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ProductService from "../service/ProductService";
import { OverlayPanel } from "primereact/overlaypanel";
import "primeicons/primeicons.css";

interface Artwork {
  title: string;
  origin: string;
  artist: string;
  inscriptions: string;
  startYear: number;
  endYear: number;
}

export default function ArtworkDataTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectionCount, setSelectionCount] = useState<number | "">("");
  const op = useRef<any>(null);

  const rows = 12;

  const loadArtworks = async (page: number) => {
    const response = await ProductService.getAllProducts(page);
    const data = await response.json();

    const artworksData = data.data || [];
    const artworks: Artwork[] = artworksData.map((item: any) => ({
      title: item.title,
      origin: item.place_of_origin,
      artist: item.artist_display,
      inscriptions: item.inscriptions || "N/A",
      startYear: item.date_start,
      endYear: item.date_end,
    }));

    return {
      artworks,
      total: data.pagination?.total || 0,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { artworks, total } = await loadArtworks(currentPage);
        setArtworks(artworks);
        setTotalRecords(total);
      } catch (error) {
        console.error("Failed to load artworks:", error);
        setArtworks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  const handlePageChange = (event: { page?: number }) => {
    if (event.page !== undefined) {
      setCurrentPage(event.page + 1);
    }
  };

  const selectRows = async () => {
    if (!selectionCount || selectionCount <= 0) return;

    const targetCount = selectionCount;
    let selected: Artwork[] = [];
    let pageToFetch = currentPage;
    let currentData = [...artworks];

    // Collect artworks from current and subsequent pages if needed
    while (selected.length < targetCount) {
      const remainingNeeded = targetCount - selected.length;
      const available = currentData.slice(0, remainingNeeded);
      selected.push(...available);

      if (selected.length < targetCount && currentData.length === rows) {
        pageToFetch++;
        try {
          const { artworks: nextPageData } = await loadArtworks(pageToFetch);
          currentData = nextPageData;
        } catch {
          break; // Stop if we can't fetch more pages
        }
      } else {
        break;
      }
    }

    setSelectedArtworks(selected);
    op.current?.hide();
  };

  if (isLoading) return <div>Loading artworks...</div>;

  const titleHeader = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <i
        className="pi pi-chevron-down"
        style={{ fontSize: "14px", marginRight: "6px", cursor: "pointer" }}
        onClick={(e) => op.current.toggle(e)}
      />
      <span>Title</span>
      <OverlayPanel ref={op} style={{ padding: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="number"
            placeholder="Number of rows"
            value={selectionCount}
            onChange={(e) =>
              setSelectionCount(
                e.target.value === "" ? "" : parseInt(e.target.value)
              )
            }
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            onClick={selectRows}
            style={{
              padding: "6px 12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Select
          </button>
        </div>
      </OverlayPanel>
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={artworks}
        lazy
        paginator
        first={(currentPage - 1) * rows}
        rows={rows}
        totalRecords={totalRecords}
        onPage={handlePageChange}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No artworks found."
        selection={selectedArtworks}
        onSelectionChange={(e: any) => setSelectedArtworks(e.value)}
        dataKey="title"
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header={titleHeader} />
        <Column field="origin" header="Origin" />
        <Column field="artist" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="startYear" header="Start Year" />
        <Column field="endYear" header="End Year" />
      </DataTable>
    </div>
  );
}
