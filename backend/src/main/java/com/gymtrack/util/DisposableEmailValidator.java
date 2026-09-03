package com.gymtrack.util;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public final class DisposableEmailValidator {

    private static final Set<String> DISPOSABLE_DOMAINS;

    static {
        Set<String> domains = new HashSet<>();
        // Major temporary / throwaway / disposable email services
        String[] domainList = new String[] {
            "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmail.net",
            "10minutemail.com", "10minutemail.net", "10minutemail.org", "10minuteinbox.com",
            "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz",
            "guerrillamailblock.com", "sharklasers.com", "grr.la", "pokemail.net", "spam4.me",
            "mailinator.com", "mailinator.net", "mailinator2.com", "suremail.info", "notmailinator.com",
            "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf", "courriel.fr.nf",
            "trashmail.com", "trashmail.net", "trashmail.me", "trashmail.org",
            "dispostable.com", "throwawaymail.com", "fakeinbox.com", "getairmail.com",
            "mohmal.com", "mohmal.in", "crazymailing.com", "mytemp.email",
            "inboxkitten.com", "tempinbox.com", "tempail.com", "generator.email",
            "emailondeck.com", "dropmail.me", "fakemailgenerator.com",
            "nada.ltd", "getnada.com", "burnermail.io", "maildrop.cc",
            "mailsac.com", "minuteinbox.com", "tempr.email", "discard.email",
            "trash-mail.com", "mailnesia.com", "harakirimail.com", "bccto.me",
            "bupmail.com", "0-mail.com", "zoemail.org", "boximail.com",
            "fakemail.net", "tmail.ws", "tempmailo.com", "tempm.com",
            "yapped.net", "mohmal.im", "nada.email", "armyspy.com",
            "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu",
            "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com",
            "teleworm.us", "disposablemail.com", "tempemail.co", "mytempmail.com",
            "trashymail.com", "mailforspam.com", "spambox.us", "safetymail.info"
        };
        for (String d : domainList) {
            domains.add(d.toLowerCase());
        }
        DISPOSABLE_DOMAINS = Collections.unmodifiableSet(domains);
    }

    private DisposableEmailValidator() {}

    public static boolean isDisposable(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase().trim();
        if (domain.isEmpty()) {
            return false;
        }

        // Exact match
        if (DISPOSABLE_DOMAINS.contains(domain)) {
            return true;
        }

        // Subdomain check (e.g. user@abc.yopmail.com or user@anything.mailinator.com)
        for (String disposable : DISPOSABLE_DOMAINS) {
            if (domain.endsWith("." + disposable)) {
                return true;
            }
        }

        return false;
    }

    public static void validateNotDisposable(String email) {
        if (isDisposable(email)) {
            throw new IllegalArgumentException(
                "Disposable and temporary email addresses are not allowed. Please use a permanent email provider (e.g. Gmail, Outlook, Yahoo, iCloud)."
            );
        }
    }
}
