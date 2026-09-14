import { useState, useRef, type DragEvent } from "react";
import { Upload, X, Loader2, ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}

export function ImageUploader({ value, onChange, folder = "products", label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [linkValue, setLinkValue] = useState(value ?? "");
  const [dragOver, setDragOver] = useState(false);
  const [showInterface, setShowInterface] = useState(!label || !!value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
      onChange(data.publicUrl);
      setLinkValue(data.publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const applyLink = () => {
    const url = linkValue.trim();
    if (!url) {
      onChange(null);
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL");
      return;
    }
    onChange(url);
    toast.success("Image link set");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /* Compact "+ Add More" button when label is set and no value */
  if (label && !value && !showInterface) {
    return (
      <button
        type="button"
        onClick={() => setShowInterface(true)}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-secondary/30 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-secondary/60 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Link input + Upload button row */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://..."
          value={linkValue}
          onChange={(e) => setLinkValue(e.target.value)}
          onBlur={applyLink}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyLink();
            }
          }}
          className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
      </div>

      {/* Preview OR Drop zone */}
      {value ? (
        <div className="relative inline-block">
          <div className="overflow-hidden rounded-lg border bg-secondary/40">
            <img src={value} alt="Preview" className="h-40 w-40 object-contain p-2" />
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setLinkValue(""); setShowInterface(false); }}
            className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow ring-1 ring-border hover:bg-secondary"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-secondary/30 px-4 py-8 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-secondary/60 ${
            dragOver ? "border-primary bg-secondary/60" : ""
          }`}
        >
          <ImageIcon className="h-7 w-7" />
          <p>Drag image here or click to upload</p>
          <p className="text-[10px] opacity-70">PNG, JPG, WEBP · up to 5 MB</p>
        </div>
      )}
    </div>
  );
}
