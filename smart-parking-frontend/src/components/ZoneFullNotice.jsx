import { useTranslation } from '../i18n';

// Shown instead of a plain error when an allocation fails because the zone is full.
function ZoneFullNotice({ zoneName, suggestedZone }) {
  const { t } = useTranslation();

  if (!suggestedZone) {
    return <p className="scan-message">{t('zoneFullNoSuggest', { zone: zoneName })}</p>;
  }

  return (
    <p className="zone-suggest" role="status">
      <span className="zone-suggest-arrow" aria-hidden="true">
        ➜
      </span>
      <span>
        {t('zoneFullSuggest', {
          zone: zoneName,
          suggested: suggestedZone.zoneName,
          count: suggestedZone.available
        })}
        {suggestedZone.distanceKm !== null && <>, {t('distanceAway', { km: suggestedZone.distanceKm })}</>}
      </span>
    </p>
  );
}

export default ZoneFullNotice;
