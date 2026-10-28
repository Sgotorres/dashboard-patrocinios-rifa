import React, { useState } from 'react';
import { Sparkles, Upload, X, Globe, AtSign, ClipboardPaste, ExternalLink, CheckCircle } from 'lucide-react';
import { LogoAvatar } from '../common/LogoAvatar';
import { cleanSocialHandle, isDirectImageUrl, resolveEnrichedLogo, type EnrichmentResult } from '../../../core/utils/logoResolver';

interface Props {
  businessName: string;
  logoUrl: string;
  socialUrl: string;
  onLogoChange: (url: string) => void;
  onSocialChange: (url: string) => void;
}

export const LogoFetcherInput: React.FC<Props> = ({
  businessName,
  logoUrl,
  socialUrl,
  onLogoChange,
  onSocialChange,
}) => {
  const [fetching, setFetching] = useState(false);
  const [, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const parsedSocial = cleanSocialHandle(socialUrl || '');

  const handleEnrichLogo = async () => {
    setFetching(true);
    setStatusMessage(null);
    try {
      const result = await resolveEnrichedLogo(socialUrl, businessName);
      setEnrichment(result);
      onLogoChange(result.logoUrl);

      if (result.exactSocialUrl) {
        onSocialChange(result.exactSocialUrl);
      }

      if (result.source === 'instagram-avatar' || result.source === 'microlink') {
        setStatusMessage(`Cuenta verificada: @${parsedSocial.handle}. Redirige directamente a su perfil oficial.`);
      } else if (result.source === 'brandfetch') {
        setStatusMessage(`Logotipo oficial obtenido por Brandfetch API (${result.brandName || 'Marca'})`);
      } else {
        setStatusMessage('Logotipo web detectado exitosamente');
      }
    } catch {
      setStatusMessage('No se pudo autodetectar. Pega la imagen directamente con Ctrl+V.');
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage('La imagen debe pesar menos de 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLogoChange(reader.result);
        setStatusMessage('Imagen local cargada');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard) {
        if (navigator.clipboard.read) {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    onLogoChange(reader.result);
                    setStatusMessage('Imagen pegada desde el portapapeles');
                  }
                };
                reader.readAsDataURL(blob);
                return;
              }
            }
          }
        }
        const text = await navigator.clipboard.readText();
        if (text) {
          if (isDirectImageUrl(text)) {
            onLogoChange(text.trim());
            setStatusMessage('Enlace directo de imagen asignado');
          } else {
            const { fullUrl } = cleanSocialHandle(text.trim());
            onSocialChange(fullUrl || text.trim());
            setStatusMessage('Enlace de Instagram detectado. Pulsa "Auto-cargar con API".');
          }
        }
      }
    } catch {
      setStatusMessage('Presiona Ctrl+V para pegar directamente');
    }
  };

  return (
    <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Vincular Cuenta de Instagram o Red Social</span>
        </label>
        {logoUrl && (
          <button
            type="button"
            onClick={() => { onLogoChange(''); setStatusMessage(null); setEnrichment(null); }}
            className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <X className="w-3 h-3" /> Quitar
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        <LogoAvatar
          name={businessName || 'Comercio'}
          logoUrl={logoUrl}
          socialUrl={socialUrl}
          size="lg"
        />

        <div className="flex-1 space-y-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              {parsedSocial.isInstagram ? (
                <AtSign className="w-3.5 h-3.5 text-pink-500" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              )}
            </span>
            <input
              type="text"
              value={socialUrl}
              onChange={(e) => {
                const val = e.target.value;
                const cleaned = cleanSocialHandle(val);
                onSocialChange(cleaned.fullUrl || val);
              }}
              placeholder="Pega el link de Instagram (ej: instagram.com/usuario_del_local)"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleEnrichLogo}
              disabled={fetching || (!socialUrl && !businessName)}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40 transition-colors shadow-xs"
              title="Detectar cuenta y cargar logo correspondiente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{fetching ? 'Detectando...' : 'Auto-cargar con API'}</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="flex items-center gap-1 py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs transition-colors"
              title="Pegar imagen o enlace del portapapeles"
            >
              <ClipboardPaste className="w-3 h-3 text-indigo-500" />
              <span>Pegar (Ctrl+V)</span>
            </button>

            <label className="flex items-center gap-1 py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs transition-colors">
              <Upload className="w-3 h-3 text-slate-400" />
              <span>Subir</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {parsedSocial.isInstagram && parsedSocial.handle && (
              <a
                href={parsedSocial.fullUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 py-1.5 px-2.5 text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-lg border border-pink-200 dark:border-pink-900/60 transition-colors"
                title={`Abrir perfil directo de @${parsedSocial.handle}`}
              >
                <span>Abrir @{parsedSocial.handle}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {statusMessage && (
        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </p>
      )}

      {parsedSocial.isInstagram && parsedSocial.handle && (
        <div className="p-2 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 rounded-lg text-[11px] text-pink-700 dark:text-pink-300 flex items-center justify-between">
          <span>Cuenta oficial vinculada: <strong>@{parsedSocial.handle}</strong></span>
          <span className="text-[10px] text-pink-600 dark:text-pink-400">Redirige a este perfil exacto</span>
        </div>
      )}
    </div>
  );
};
