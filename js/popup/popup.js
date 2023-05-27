chrome.runtime.getBackgroundPage((bgWindow) => {

  const app = bgWindow.reedy;
  let runShortcut;
  let newShortcut;

  const $body = document.querySelector('body');
  const $startReadingBtn = document.querySelector('.j-startReadingBtn');
  const $startSelectorBtn = document.querySelector('.j-startContentSelectorBtn');
  const $closeReaderBtn = document.querySelector('.j-closeReaderBtn');
  const $views = document.querySelectorAll('[view-name]');
  const $iShortcut = document.querySelector('.j-iShortcut');
  const $saveShortcutBtn = document.querySelector('.j-saveShortcutBtn');
  const $cancelShortcutBtn = document.querySelector('.j-cancelShortcutBtn');

  const navigation = new Navigation(
    document.querySelector('.j-navigation'),
    document.querySelectorAll('.j-navigationItem'),
    document.querySelectorAll('.j-navigationContent')
  );

  chrome.runtime.connect({ name: 'Popup' });

  app.localizeElements(document);

  app.sendMessageToSelectedTab({ type: 'isReaderStarted' }, (isReaderStarted) => {
    if (isReaderStarted) {
      $startSelectorBtn.setAttribute('hidden', true);
      $closeReaderBtn.setAttribute('hidden', false);
    } else {
      app.sendMessageToSelectedTab({ type: 'isOfflinePage' }, (isOfflinePage) => {
        if (isOfflinePage) {
          $startSelectorBtn.setAttribute('hidden', true);
        } else {
          app.getTextSelection((text) => {
            $startReadingBtn.setAttribute('hidden', !text.length);
            $startSelectorBtn.setAttribute('hidden', !!text.length);
          });
        }
      });
    }
  });

  app.getSettings(null, initControls);

  app.on(document, 'keydown', onKeyDown);
  app.on($startReadingBtn, 'click', onStartReadingClick);
  app.on($startSelectorBtn, 'click', onStartSelectorClick);
  app.on($closeReaderBtn, 'click', onCloseReaderClick);
  app.on(document.querySelector('.j-offlineBtn'), 'click', onOfflineBtnClick);
  app.each(document.querySelectorAll('a[href^=http]'), ($elem) => {
    app.on($elem, 'click', onExternalLinkClick);
  });
  app.each(document.querySelectorAll('[switch-to]'), ($elem) => {
    app.on($elem, 'click', onSwitchBtnClick);
  });
  app.on($iShortcut, 'keydown', onShortcutInputKeydown);
  app.on($saveShortcutBtn, 'click', onSaveShortcutBtn);
  app.on($cancelShortcutBtn, 'click', onCancelShortcutBtn);

  function onKeyDown(e) {
    if (runShortcut && app.checkEventForShortcut(e, runShortcut)) {
      app.stopEvent(e);
      app.getTextSelection((text) => {
        if (text.length) {
          app.event('Reader', 'Open', 'Shortcut in popup ');
          startReading();
        } else {
          app.event('Content selector', 'Start', 'Shortcut in popup');
          startSelector();
        }
      });
    }
  }

  function onStartReadingClick() {
    app.event('Reader', 'Open', 'Popup');
    startReading();
  }

  function onStartSelectorClick() {
    app.event('Content selector', 'Start', 'Popup');
    startSelector();
  }

  function onCloseReaderClick() {
    app.event('Reader', 'Close', 'Popup');
    closeReader();
  }

  function onExternalLinkClick(e) {
    app.event('External link', e.target.href);
    window.open(e.target.href);
  }

  function onSwitchBtnClick(e) {
    const viewName = e.target.getAttribute('switch-to');
    app.hideElement('.j-switchBtn', `switch-to-${viewName}`);
    app.showElement('.j-switchBtn', `switch-to-${viewName}`, true);
    app.showElement('.j-view', viewName, true);

    navigation.switchTo(viewName);
  }

  function onOfflineBtnClick() {
    app.event('Reader', 'Offline', 'Popup');
    offlinePage();
  }

  function startReading() {
    app.sendMessageToSelectedTab({ type: 'startReader' });
    closePopup();
  }

  function startSelector() {
    app.sendMessageToSelectedTab({ type: 'startContentSelector' });
    closePopup();
  }

  function closeReader() {
    app.sendMessageToSelectedTab({ type: 'closeReader' });
    closePopup();
  }

  function offlinePage() {
    app.sendMessageToSelectedTab({ type: 'offlinePage' });
    closePopup();
  }

  function closePopup() {
    window.close();
  }

  function initControls(settings) {
    const $skinThemes = document.querySelectorAll('.j-skinTheme');
    const $fontSize = document.querySelector('.j-fontSize');
    const $lineHeight = document.querySelector('.j-lineHeight');
    const $textAlign = document.querySelector('.j-textAlign');
    const $margin = document.querySelector('.j-margin');
    const $runShortcut = document.querySelector('.j-runShortcut');
    const $theme = document.querySelector('.j-theme');
    const $customizeTheme = document.querySelector('.j-customizeTheme');
    const $backgroundColor = document.querySelector('.j-backgroundColor');
    const $textColor = document.querySelector('.j-textColor');
    const $linkColor = document.querySelector('.j-linkColor');
    const $highlightColor = document.querySelector('.j-highlightColor');
    const $codeTheme = document.querySelector('.j-codeTheme');

    if (settings) {
      $skinThemes.forEach(($elem) => {
        if ($elem.getAttribute('value') === settings.skin) {
          $elem.setAttribute('checked', true);
        }
      });

      $fontSize.value = settings.fontSize;
      $lineHeight.value = settings.lineHeight;
      $textAlign.value = settings.textAlign;
      $margin.value = settings.margin;
      $runShortcut.value = app.getShortcutString(settings.runShortcut);
      $theme.value = settings.theme;
      $customizeTheme.checked = settings.customizeTheme;
      $backgroundColor.value = settings.backgroundColor;
      $textColor.value = settings.textColor;
      $linkColor.value = settings.linkColor;
      $highlightColor.value = settings.highlightColor;
      $codeTheme.value = settings.codeTheme;
    }

    app.on($skinThemes, 'change', onSkinThemeChange);
    app.on($fontSize, 'input', onFontSizeInput);
    app.on($lineHeight, 'input', onLineHeightInput);
    app.on($textAlign, 'change', onTextAlignChange);
    app.on($margin, 'input', onMarginInput);
    app.on($runShortcut, 'focus', onShortcutInputFocus);
    app.on($theme, 'change', onThemeChange);
    app.on($customizeTheme, 'change', onCustomizeThemeChange);
    app.on($backgroundColor, 'change', onBackgroundColorChange);
    app.on($textColor, 'change', onTextColorChange);
    app.on($linkColor, 'change', onLinkColorChange);
    app.on($highlightColor, 'change', onHighlightColorChange);
    app.on($codeTheme, 'change', onCodeThemeChange);

    navigation.switchTo('shortcut'); // Switch to the initial navigation item
  }

  function onSkinThemeChange(e) {
    const skin = e.target.value;
    app.setSettings({ skin });
  }

  function onFontSizeInput(e) {
    const fontSize = e.target.value;
    app.setSettings({ fontSize });
  }

  function onLineHeightInput(e) {
    const lineHeight = e.target.value;
    app.setSettings({ lineHeight });
  }

  function onTextAlignChange(e) {
    const textAlign = e.target.value;
    app.setSettings({ textAlign });
  }

  function onMarginInput(e) {
    const margin = e.target.value;
    app.setSettings({ margin });
  }

  function onShortcutInputFocus() {
    runShortcut = null;
    newShortcut = null;
  }

  function onShortcutInputKeydown(e) {
    const key = e.keyCode || e.which;
    if (key === 27) {
      onCancelShortcutBtn();
    } else {
      newShortcut = app.getShortcutFromEvent(e);
      $runShortcut.value = app.getShortcutString(newShortcut);
    }
  }

  function onSaveShortcutBtn() {
    if (newShortcut) {
      runShortcut = newShortcut;
      app.setSettings({ runShortcut });
      app.event('Shortcut', 'Set');
    }
    navigation.switchTo('settings');
  }

  function onCancelShortcutBtn() {
    navigation.switchTo('settings');
  }

  function onThemeChange(e) {
    const theme = e.target.value;
    app.setSettings({ theme });
  }

  function onCustomizeThemeChange(e) {
    const customizeTheme = e.target.checked;
    app.setSettings({ customizeTheme });
  }

  function onBackgroundColorChange(e) {
    const backgroundColor = e.target.value;
    app.setSettings({ backgroundColor });
  }

  function onTextColorChange(e) {
    const textColor = e.target.value;
    app.setSettings({ textColor });
  }

  function onLinkColorChange(e) {
    const linkColor = e.target.value;
    app.setSettings({ linkColor });
  }

  function onHighlightColorChange(e) {
    const highlightColor = e.target.value;
    app.setSettings({ highlightColor });
  }

  function onCodeThemeChange(e) {
    const codeTheme = e.target.value;
    app.setSettings({ codeTheme });
  }

});
