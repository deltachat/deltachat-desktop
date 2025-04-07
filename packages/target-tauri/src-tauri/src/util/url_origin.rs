pub trait UrlOriginExtension {
    fn origin_no_opaque(&self) -> (&str, Option<url::Host<&str>>, Option<u16>);
}

impl UrlOriginExtension for url::Url {
    /// Similar to [`url::Url::origin`], but returns a non-opaque origin
    /// even for custom protocols, such as `webxdc:`.
    ///
    /// Note that this function is also slightly different from
    /// [`url::Url::origin`] in other ways, such as the fact that it utilizes
    /// [`Url::port`] instead of [`Url::port_or_known_default`],
    /// which is probably divergent from the spec,
    /// but should me more conservative when in comes to comparing two origins.
    ///
    /// # Example
    ///
    /// ```
    /// let url_1 = Url::from_str("webxdc://dummy.host/index.html");
    ///
    /// let url_2 = Url::from_str("webxdc://dummy.host/other.html");
    /// assert_eq!(url_1.origin_no_opaque(), url_2.origin_no_opaque());
    ///
    /// let url_3 = Url::from_str("dcblob://dummy.host/index.html");
    /// assert_ne!(url_1.origin_no_opaque(), url_3.origin_no_opaque());
    /// let url_4 = Url::from_str("webxdc://other-dummy.host/index.html");
    /// assert_ne!(url_1.origin_no_opaque(), url_4.origin_no_opaque());
    /// let url_5 = Url::from_str("https://example.com/index.html");
    /// assert_ne!(url_1.origin_no_opaque(), url_5.origin_no_opaque());
    /// ```
    fn origin_no_opaque(&self) -> (&str, Option<url::Host<&str>>, Option<u16>) {
        (self.scheme(), self.host(), self.port())
    }
}
