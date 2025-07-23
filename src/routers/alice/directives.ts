export interface SoundSetLevelDirective {
    type: "soundSetLevel";
    newLevel: number;
}

export interface SoundQuieterDirective {
    type: "soundQuieter";
}

export interface SoundLouderDirective {
    type: "soundLouder";
}

export type AliceDirective = SoundSetLevelDirective | SoundQuieterDirective | SoundLouderDirective;

export function convertToAliceResponseDirective(directive: AliceDirective): any {
    switch (directive.type) {
        case "soundSetLevel":
            return {
                Type: "client_action",
                Name: "sound_set_level",
                AnalyticsType: "sound_set_level",
                Payload: {
                    fields: {
                        new_level: {
                            numberValue: directive.newLevel
                        },
                        new_percent_level: {
                            numberValue: directive.newLevel * 10
                        }
                    }
                },
                IsLedSilent: true
            };
        case "soundLouder":
            return {
                Type: "client_action",
                Name: "sound_louder",
                AnalyticsType: "sound_louder",
                Payload: {},
                IsLedSilent: true
            };
        case "soundQuieter":
            return {
                Type: "client_action",
                Name: "sound_quiter",
                AnalyticsType: "sound_quiter",
                Payload: {},
                IsLedSilent: true
            };
    }
}