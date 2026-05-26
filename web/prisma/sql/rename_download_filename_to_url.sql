-- Downloads now point to external share links (Google Drive, etc.) instead of
-- files served from web/public/downloads/. Rename the column accordingly and
-- widen it for long share URLs. Safe: cms_downloads is empty.
ALTER TABLE `cms_downloads` CHANGE `filename` `url` VARCHAR(500) NOT NULL;
