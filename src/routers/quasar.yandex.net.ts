import {Application, Router} from "express";
import {getLogger} from "../logger";
import {randomBytes} from "node:crypto";

const logger = getLogger();

export function registerQuasarYandexNetRouter(app: Application): void {
    const router = Router();

    router.get("/check_updates", (req, res) => {
        logger.debug(`Requested updates: ${JSON.stringify(req.query)}`);

        res.json({
            hasUpdate: false
        });
    });

    router.get("/glagol/device_list", (req, res) => {
        logger.debug(`Requested glagol device list: ${JSON.stringify(req.query)}`);
        res.json({
            "devices": [],
            "status": "ok"
        });
    });

    router.get("/get_sync_info", (req, res) => {
        logger.debug(`Get sync info: ${JSON.stringify(req.query)}`);
        res.json({
            "alice_pro_subscription": {
                "enabled": false
            },
            "config": {
                "account_config": {
                    "aliceAdaptiveVolume": {
                        "enabled": true
                    },
                    "aliceProactivity": true,
                    "alwaysOnMicForShortcuts": false,
                    "childContentAccess": "children",
                    "contentAccess": "medium",
                    "doNotUseUserLogs": false,
                    "enableChildVad": false,
                    "enabledCommandSpotters": {
                        "call": {
                            "answer": false
                        },
                        "music": {
                            "bluetooth": false,
                            "feedback": false,
                            "navigation": true,
                            "playAndPause": true,
                            "volume": true
                        },
                        "smartHome": {
                            "light": false,
                            "tv": false
                        },
                        "tv": {
                            "backToHome": false,
                            "navigation": true
                        }
                    },
                    "jingle": false,
                    "saveHistoryUsage": true,
                    "smartActivation": true,
                    "spotter": "alisa",
                    "useBiometryChildScoring": true,
                    "user_wifi_config": {
                        "wifi_hash": "324aeab328904d0579a958fade6af30af27717e482709a12ca1e0aac7d76df01"
                    }
                },
                "device_config": {
                    "beta": false,
                    "dndMode": {
                        "enabled": false,
                        "features": {
                            "allowIncomingCalls": false
                        }
                    },
                    "led": {
                        "time_visualization": {
                            "format": "24h"
                        }
                    },
                    "locale": "ru-RU",
                    "location": {
                        "latitude": 59.999996,
                        "longitude": 30.297218
                    },
                    "name": "Яндекс Станция 2",
                    "standby": {
                        "deepStandbyEnabled": true,
                        "deepStandbyTimeoutMinutes": 240
                    },
                    "tv_beta": false
                },
                "system_config": {
                    "aliceProAnimation": {
                        "isAllowed": true
                    },
                    "appmetrikaReportEnvironment": {
                        "quasmodrom_group": "production",
                        "quasmodrom_subgroup": "production",
                        "test_buckets": "1303410,0,66;1294446,0,48;1298215,0,28;1283235,0,23;1284665,0,34;721146,0,10;721155,0,34;1299237,0,27;1287579,0,59;1217762,0,78;945524,0,81;950035,0,41;1283448,0,6;1092141,0,30;1113168,0,11;1062321,0,81;956122,0,95;1245778,0,13;1248872,0,30;1075180,0,33;1077569,0,53;1077987,0,21;1208695,0,11;1281046,0,5;1288686,0,10;1277298,0,90;1217513,0,59;1233158,0,53;1145139,0,24;1287409,0,23;1289661,0,49;1289675,0,21;1288338,0,62;1229598,0,99;1215900,0,35",
                        "testids": "1058670_1058695_1058696_1058739_1058743_1058746_1074585_1098487_1118599_1155918_1262273_1283235_1294733_1298215_1299237_1302389_1303410_1303884_721146_721155"
                    },
                    "audioInput": {
                        "audioDevice": {
                            "vqe": {
                                "preset": {
                                    "audioCallConfigs": {
                                        "babyMonitorConfig": {
                                            "omniChannelGainCoefficient": [
                                                100
                                            ]
                                        },
                                        "regularCallConfig": {
                                            "neuralNoiseReducerConfig": {
                                                "enabled": true,
                                                "inputType": "WAVE",
                                                "modelOutputApplierType": "GTCRN",
                                                "opResolverType": "NO_DEFAULT_DELEGATES",
                                                "preprocessorType": "GTCRN",
                                                "type": "TFLITE",
                                                "useXnnPack": false
                                            },
                                            "webRtcNoiseReducerConfig": {
                                                "enabled": false
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "model_storage": {
                            "models": {
                                "spotter": {
                                    "activation/yasmina": {
                                        "crc": 1134983709,
                                        "fallbackUrls": [
                                            "https://quasar.s3.yandex.net/spotters/oqvitkh_ar-SA-quasar-yasmina-22Nov24-x3-v18-orig-target-no-ca.zip"
                                        ],
                                        "format": "zip",
                                        "type": "activation",
                                        "url": "https://cdnragrcyui4owdlxwfs.svc.cdn.yandex.net/spotters/oqvitkh_ar-SA-quasar-yasmina-22Nov24-x3-v18-orig-target-no-ca.zip",
                                        "word": "yasmina"
                                    },
                                    "command": {
                                        "crc": 4188111014,
                                        "fallbackUrls": [
                                            "https://quasar.s3.yandex.net/spotters/hrleh_ru-RU-quasar-commands-14Apr25-17-30-midi-shrd-bt-likes-q16-rt-dqmm.zip"
                                        ],
                                        "format": "zip",
                                        "type": "command",
                                        "url": "https://cdnrlh4uplgcoewzir6e.svc.cdn.yandex.net/spotters/hrleh_ru-RU-quasar-commands-14Apr25-17-30-midi-shrd-bt-likes-q16-rt-dqmm.zip"
                                    },
                                    "intonationInterruption": {
                                        "crc": 2261931229,
                                        "fallbackUrls": [
                                            "https://quasar.s3.yandex.net/spotters/caqjz_ru-RU-quasar-intonation-interruption-19Jun25-q16-suppress.zip"
                                        ],
                                        "format": "zip",
                                        "url": "https://cdnrlh4uplgcoewzir6e.svc.cdn.yandex.net/spotters/caqjz_ru-RU-quasar-intonation-interruption-19Jun25-q16-suppress.zip"
                                    }
                                },
                                "vqeModels": {
                                    "noise_reducer": {
                                        "crc": 614060809,
                                        "format": "zip",
                                        "url": "https://cdnrlh4uplgcoewzir6e.svc.cdn.yandex.net/spotters/fxuju_evil_840_2025_05_20_gtcrb_attn.zip"
                                    }
                                }
                            }
                        }
                    },
                    "audio_player_capability": {
                        "enableSmartCrossfade": true,
                        "qualityChangeReaction": "runtime"
                    },
                    "audioclient": {
                        "enableHlsPipeline": true,
                        "gogol": {
                            "keepAlive": true
                        }
                    },
                    "bio_capability": {
                        "custom_model_checksum": "66e9fd3629c90557e5e332f184a3b660",
                        "custom_model_url": "https://cdnrlh4uplgcoewzir6e.svc.cdn.yandex.net/biometry/ewnwxlpscq_tflite-bad-0.7.0-0910.zip",
                        "model_storage": {
                            "models": {
                                "bio": {
                                    "bio_lingware": {
                                        "checksum": "66e9fd3629c90557e5e332f184a3b660",
                                        "fallbackUrls": [
                                            "https://quasar.s3.yandex.net/biometry/ciuodgbahv_next-small-v1-thr66.zip",
                                            "https://quasar.s3.yandex.net/biometry/ewnwxlpscq_tflite-bad-0.7.0-0910.zip",
                                            "https://quasar.s3.yandex.net/biometry/sylfssreee_sqw-014-age-clf-v6-gender-clf-v3.zip"
                                        ],
                                        "format": "zip",
                                        "url": "https://cdnrlh4uplgcoewzir6e.svc.cdn.yandex.net/biometry/ewnwxlpscq_tflite-bad-0.7.0-0910.zip"
                                    }
                                }
                            }
                        },
                        "rss_limit_kb": 6500,
                        "use_ondevice_classification": true
                    },
                    "calld": {
                        "audio_processing_config": {
                            "pre_amplifier": {
                                "enabled": true,
                                "fixed_gain_factor": 72
                            }
                        },
                        "auto_gain_control": true,
                        "tx_agc_digital_compression_gain": 72
                    },
                    "com.yandex.capabilities": {
                        "appLaunchCapabilityEnabled": true,
                        "detailsCapability": {
                            "openPurchaseProcessDirectiveEnabled": true
                        },
                        "detailsCapabilityEnabled": true,
                        "serialNavigatorCapability": {
                            "openPurchaseDirectiveEnabled": true,
                            "showEpisodeDirectiveEnabled": true
                        },
                        "serialNavigatorCapabilityEnabled": true
                    },
                    "com.yandex.tv.home": {
                        "detailsProtoHttpEnabled": true,
                        "serialNavigatorScreen": {
                            "enumerationEnabled": true,
                            "newSerialNavigatorEnabledV3": true,
                            "voiceControlsEnabled": true
                        }
                    },
                    "com.yandex.tv.services": {
                        "notifications": {
                            "whitelist": [
                                "purchasedSuccessfulNotification"
                            ]
                        }
                    },
                    "device_control_panel": {
                        "checkAliceProSubscription": true
                    },
                    "env": {
                        "quasmodrom_group": "production",
                        "quasmodrom_subgroup": "production",
                        "test_buckets": "1303410,0,66;1294446,0,48;1298215,0,28;1283235,0,23;1284665,0,34;721146,0,10;721155,0,34;1299237,0,27;1287579,0,59;1217762,0,78;945524,0,81;950035,0,41;1283448,0,6;1092141,0,30;1113168,0,11;1062321,0,81;956122,0,95;1245778,0,13;1248872,0,30;1075180,0,33;1077569,0,53;1077987,0,21;1208695,0,11;1281046,0,5;1288686,0,10;1277298,0,90;1217513,0,59;1233158,0,53;1145139,0,24;1287409,0,23;1289661,0,49;1289675,0,21;1288338,0,62;1229598,0,99;1215900,0,35",
                        "testids": "1058670_1058695_1058696_1058739_1058743_1058746_1074585_1098487_1118599_1155918_1262273_1283235_1294733_1298215_1299237_1302389_1303410_1303884_721146_721155"
                    },
                    "experiments": [
                        "bg_enable_say_with_emotion",
                        "enable_apphosted_notifications",
                        "enrollment_x_token_enabled",
                        "hw_enable_audio_speed_scenario",
                        "hw_enable_say_with_emotion",
                        "hw_music_enable_smart_crossfade",
                        "hw_music_fm_radio_add_safe_timeline_cgi_to_stream_url",
                        "hw_voiceprint_enable_enrollment_sharing"
                    ],
                    "fluent-bit": {
                        "samplingRatio": 0.5
                    },
                    "forceWifiReconfigure": false,
                    "hybrid_request_factory": {
                        "hybrid": {
                            "scenarios": {
                                "fast_command_scenario": {
                                    "supported_frames": [
                                        "personal_assistant.scenarios.bluetooth_off",
                                        "personal_assistant.scenarios.bluetooth_on",
                                        "personal_assistant.scenarios.player.continue",
                                        "personal_assistant.scenarios.player.next_track",
                                        "personal_assistant.scenarios.player.pause",
                                        "personal_assistant.scenarios.player.previous_track",
                                        "personal_assistant.scenarios.sound.louder",
                                        "personal_assistant.scenarios.sound.quiter"
                                    ]
                                }
                            }
                        },
                        "hybrid_text_inputs": true
                    },
                    "iot": {
                        "finishSystemDiscoveryAccumulateTimeout": 120,
                        "maxFinishSystemDiscoveryAccumulateTimeout": 180,
                        "providers": {
                            "Matter": true
                        },
                        "syncEndpoints": true,
                        "syncEndpointsRemoveEnable": true,
                        "systemDiscovery": true
                    },
                    "iot_scenarios": {
                        "syncOnNonExistingDb": true
                    },
                    "maind": {
                        "selfDestroyer": {
                            "additionalMemoryLimitsKb": {
                                "intonationInterruptionModel": 3400
                            }
                        }
                    },
                    "matter": {
                        "enableOnOtaSystemDiscovery": true,
                        "enableSystemDiscovery": true
                    },
                    "mediad": {
                        "hlsFragmentDistance": 6,
                        "hlsRandomizePlaylists": true
                    },
                    "onlineSpotterEnabled": true,
                    "phone_calls": {
                        "ats_manager": true,
                        "block_updates_on_call": true,
                        "enabled": true,
                        "execute_server_callbacks": true,
                        "mts": {
                            "geo_validation": {
                                "ignore_empty_location": true,
                                "radius_meter": 5000,
                                "use_first_geo_actual_data_as_registration_data": true
                            }
                        },
                        "pjsip": {
                            "register_on_add": false
                        },
                        "webrtc": {
                            "enabled": true
                        }
                    },
                    "qrPaymentConfig": {
                        "cardDetails": {
                            "playAfterLogin": true,
                            "playAfterPurchase": true,
                            "pollingApiEnabled": false,
                            "showQrAfterLogin": true
                        },
                        "checkActiveUserIsOwnerEnabled": true,
                        "qrPaymentEnabled": true,
                        "redesignEnabledV3": true
                    },
                    "quasmodrom_group": "production",
                    "quasmodrom_subgroup": "production",
                    "selfDestroyer": {
                        "additionalMemoryLimitsKb": {
                            "intonationInterruptionModel": 3400
                        }
                    },
                    "sendVinsRequestProto": true,
                    "shouldCheckWifi": false,
                    "smart_volume": {
                        "enabled": true
                    },
                    "teleme3d": {
                        "appmetrica": {
                            "+events": [
                                "directiveHandled",
                                "directiveStarted",
                                "directiveCompleted"
                            ]
                        },
                        "clickdaemon": {
                            "+events": [
                                "ntpException",
                                "ntpSync",
                                "track_start"
                            ]
                        },
                        "priorities": {},
                        "samplingRatio": 0.7
                    },
                    "telemetry": {
                        "rate_limiter": {
                            "groups": [
                                {
                                    "count_limit": 1,
                                    "events": [
                                        "ysk_spotter_queue_overflow"
                                    ],
                                    "interval_ms": 120000
                                }
                            ]
                        }
                    },
                    "unbound": {
                        "checkHosts": [
                            "quasar.yandex.net",
                            "uniproxy.alice.yandex.net",
                            "scbh.yandex.net"
                        ],
                        "enable": true,
                        "forwarders": [
                            "77.88.8.1",
                            "77.88.8.8",
                            "77.88.8.88",
                            "77.88.8.2",
                            "1.1.1.1"
                        ],
                        "serverParams": [
                            "msg-cache-size: 2m",
                            "rrset-cache-size: 2m",
                            "username: \"nobody\""
                        ]
                    },
                    "useVinsRequestProto": true,
                    "voiceDialogSettings": {
                        "backoffUseNew": true,
                        "blockUpdateSettingsWhileActiveRequest": true,
                        "commandSpotterSettings": {
                            "spotterLoggingRareEventPercent": 100
                        },
                        "intonationInterruptionSpotterSettings": {
                            "spotterLoggingRareEventPercent": 100
                        },
                        "recognizer": {
                            "packSoundBuffer": true
                        },
                        "spotterLoggingRareEventPercent": 1
                    },
                    "voice_activity_detector": {
                        "events_enabled": true
                    },
                    "wifiSettings": {
                        "generate204": {
                            "failPeriodMs": 10000,
                            "maxFailAttempts": 3,
                            "periodOnLastFailAttemptMs": 30000,
                            "periodSec": 30,
                            "timeoutMs": 8000
                        }
                    },
                    "wifi_capability": {
                        "enabled_v2": true
                    }
                }
            },
            "glagol": {
                "security": {
                    "server_certificate": "-----BEGIN CERTIFICATE-----\nMIIC3TCCAcWgAwIBAgIBATANBgkqhkiG9w0BAQsFADAyMQswCQYDVQQGEwJSVTES\nMBAGA1UEAwwJbG9jYWxob3N0MQ8wDQYDVQQKDAZZYW5kZXgwHhcNMjUwNjI4MTMy\nOTM3WhcNMjgwNjI3MTMyOTM3WjAyMQswCQYDVQQGEwJSVTESMBAGA1UEAwwJbG9j\nYWxob3N0MQ8wDQYDVQQKDAZZYW5kZXgwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw\nggEKAoIBAQDy0nW8IvBi2bxnjscRM+hhR6CNEO9ZgfLdjFmXOMj+Tj5inX1nLQwD\nXdFK8XwOEvZnPXzcgqUP8q2VEoBzJCTJsSb9vctt6wBfBM/02JB22Hk9oS9XBzQP\nzzbUB5+Kx7JHZbm2ERy/cmezdjYMbTVQwGj3+n6/ptCApSQ0Y5VFPhSfAmHPOQwm\nilKsvzsqNUIbKajNnGeIxyRsIJpJYHcHIrmmUrkWYke2hdHZVdshciUHeb4/Ml9K\ngdnn+syeE5a9vi6ZxIhy7ZL6l1tcMI0oUHtFw4KMPZ2SnKSK033SrbwXlg62ZdZo\n1BNKN+ysNnLiE05PK+TuPvtjNmtTKkC/AgMBAAEwDQYJKoZIhvcNAQELBQADggEB\nAFMSYdtbCd8gKmfu+sfGFFEpBzGVqMik7pjc83vt4mtVRze38eqFxJAsoqWUZZDz\nKaPcdC5OJmTlQolnb65+2EPe+ITZEG5OYq0eL3aZjp5XajVtIjzBRRowXdRPbWrN\nzSithD6pZfyT5LsYtY++TlMlq035VZRoACXktyWYuevkElXLXjCnHVNqXRzd1co5\nyTuC8g8yu6aQ5y/cnE1AirYdtew0xtsojYjsMxPgzbk1s10ialQQZlajuzEuKgz1\nxANuIjoqMd7934gT1Nb+X8pbphOoXj32MVna7Q6LAQAEkNUyNGb8xlk4k2ndO/CC\nDcMrwcAhLVHXz9licmHDmw4=\n-----END CERTIFICATE-----\n",
                    "server_private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA8tJ1vCLwYtm8Z47HETPoYUegjRDvWYHy3YxZlzjI/k4+Yp19\nZy0MA13RSvF8DhL2Zz183IKlD/KtlRKAcyQkybEm/b3LbesAXwTP9NiQdth5PaEv\nVwc0D8821AefiseyR2W5thEcv3Jns3Y2DG01UMBo9/p+v6bQgKUkNGOVRT4UnwJh\nzzkMJopSrL87KjVCGymozZxniMckbCCaSWB3ByK5plK5FmJHtoXR2VXbIXIlB3m+\nPzJfSoHZ5/rMnhOWvb4umcSIcu2S+pdbXDCNKFB7RcOCjD2dkpykitN90q28F5YO\ntmXWaNQTSjfsrDZy4hNOTyvk7j77YzZrUypAvwIDAQABAoIBAC4KLXyQe1eixRA1\niBUA7IyVUiGtFlS4SN4s4EfF4oYlO7ri9YX8ioyQ20AEbWsVuVZ12BjPRJCziKn9\nKhGqxrbfOe9ebxXWOunJNczMywddoA9JYnpzyTE+Lr0g/OUJXAohhYa50+OQw4zJ\nWxIcGsHG2aA7BJE+BcZ+iVDNmN3Zuu8yuf6LEgNhxAnAg/jIkXUNQlpDA0ipa3EE\nbOOCrpnIR5qMVc1bRlSQgBOCpQdEV7J3u63NDGw/MuKV7qePyfGy9yKl6RwnMYMj\nF/iYmZG1oPv76wmDlhWmd+z1Sft2c8kvLOCYGzx082Wu0CLyIBXYsMF6E+MtZyVA\noETZo2ECgYEA+gX7AWAeDYGAkSWXQSfyPiUkz5+OeYtxS0Oh+EKc2sh4FbPsZ+fk\n72HoMeshOkRFCaDCcdFYE54IK2ILUy7gb9sUJLc8hTGMh1B88KJMHOAtBFnJu2Dq\norj1rJQGOItMVMCQju1nhqV1uUAJNdGNQ+6SWtBD527D001XqWdZRikCgYEA+KBp\nSzqhg5m2Kkc8yk8jHmFsPcTAEEcohZZt8n+/Z73NwkGDMaAwtlHrnE3oTr8Rr8KH\ntHqHTmhffnFRD5eHgasPtnR0PWSPnObIulapWUibuXledZjfXrP6/f3dJ+0X/mao\nv3MvwoEmZljBCHvtem/2/O2QEvsGa1EVu8BZHKcCgYEAof/+A4Yj8txWUbXpq24W\np+2pTF42EssnPX01FYcT2y7JoEZUh37Z98GYkb+oZ/iUQwjG9LiQOSXMZU/BxsQ4\n6EErbB7ON/9C7upYChMe/hbDFG6ZJ7BEV+tAQ/Illb2sV73t7K4mxjevb7juPtDo\nl3udmPoZBXvfpqoWgs1UKwECgYEApO8laraWdwr9gcaIWV1uWrUebUucbjAGfbhx\nb7G3dEbBvOBg/AbcydZGiwZT2gl+3i4agGvYXvd2ghcCQ2muhyLH5a4Tfra7Xsbq\n2lKrPYOhasVNGI41gEm9c8l5cQckJ6xKvdbYFBxBMRwn0k0EGXk1TEz8itrkQ0Uj\nOc48T3kCgYBUuAx29ycwrGevPWN/8N6LcCl06Aj84CrFvJJndMoIHlnelVjK1aeE\nCptcMO2Np6dg5PbRiVazLWJut275iG3GRFS3sykveKQ+GlKbnI2tZ50q0ZuDNSWT\nVAVi3GakP254Y86bWh+FU6aaTBkJVvvoGYPmfUphlXz63DXRA3omWA==\n-----END RSA PRIVATE KEY-----\n"
                }
            },
            "status": "ok",
            "subscription": {
                "mode": "transaction"
            },
            "tags": [
                "QUASARINFRA-529",
                "QUASARINFRASUP-862"
            ]
        });
    });

    app.use("/quasar.yandex.net", router);
}