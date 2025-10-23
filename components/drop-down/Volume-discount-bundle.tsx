import {
    PlusIcon
} from '@shopify/polaris-icons';
import {
    Text,
    Button,
    InlineStack,
    Checkbox,
    Card,
    BlockStack,
    Box,
    ChoiceList,
    TextField,
    ColorPicker,
    RangeSlider,
    
} from '@shopify/polaris';

import React, { useState } from "react";


export default function BundleDealSettings() {

    const [openSection, setOpenSection] = useState<string | null>('settings');
    
    const [selectedOption, setSelectedOption] = useState(['all']);
    const [buttonText, setButtonText] = useState('Choose');
    const [color, setColor] = useState({ hue: 280, saturation: 0.8, brightness: 0.8 });
    // Removed unused variable 'image'
    const [photoSize, setPhotoSize] = useState(40);
    const [showName, setShowName] = useState(true);
    const [showPriceOnly, setShowPriceOnly] = useState(false);

    const handleColorChange = (color: any) => setColor(color);

    // Volume Discount section toggle
    const [volumeDiscountEnabled, setVolumeDiscountEnabled] = useState(false);
     // volume section toggle
    const [volume, setVolume] = useState(false);


    const handleToggle = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    // Note: The following line is a placeholder for enabling volume discount functionality.
    if (false) setVolumeDiscountEnabled(true)

    return (
        <Box padding="600" maxWidth="600px" minHeight="100vh">
            <BlockStack gap="400">
                {/* Volume discount bundle with other products */}
                <Card padding="0">
                    <Box padding="300">
                        <div className="flex items-center cursor-pointer mb-1" onClick={() => handleToggle('volume-discount')}>
                            <Text as="h2" variant="headingMd" fontWeight="bold">Volume discount bundle with other products</Text>
                            <div className={openSection === 'sticky' ? 'ml-auto transition-transform duration-200 ' : 'ml-auto transition-transform duration-200'}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <label className="inline-flex items-center cursor-pointer relative">
                                            <input
                                                type="checkbox"
                                                checked={volume}
                                                onChange={e => setVolume(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-black transition-all"></div>
                                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-all peer-checked:translate-x-5"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Box>
                    {openSection === 'volume-discount' && (
                        // Volume Discount Settings
                        <Box padding="300">
                            <BlockStack gap="400">
                                {/* Eligible for bundling */}
                                <ChoiceList
                                    title="Eligible for bundling"
                                    choices={[
                                        { label: 'All products except selected', value: 'all' },
                                        { label: 'Products in selected collections', value: 'collections' },
                                        { label: 'Selected products', value: 'selected' },
                                    ]}
                                    selected={selectedOption}
                                    onChange={setSelectedOption}
                                />
                                <Button fullWidth variant="primary" onClick={() => alert('Select products')}>Select products</Button>
                                <hr className="my-4 border-gray-200" />
                                {/* Layout */}
                                <Text as="span" variant="headingSm">Layout</Text>
                                <InlineStack gap="400">
                                    {/*  upload */}
                                    <BlockStack gap="100" align="center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="volume-discount-image-upload"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // You can add logic to preview or upload the image here
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={() => document.getElementById('volume-discount-image-upload')?.click()}
                                        >
                                            Choose file
                                        </Button>
                                    </BlockStack>
                                    {/* Button text */}
                                    <TextField
                                        label="Button text"
                                        value={buttonText}
                                        onChange={setButtonText}
                                        autoComplete="off"
                                        disabled={!volumeDiscountEnabled}
                                    />
                                </InlineStack>
                                {/* Color */}
                                <Text as="span" variant="headingSm">Color</Text>
                                <Box maxWidth="300px">
                                    <ColorPicker onChange={handleColorChange} color={color} />
                                </Box>
                                {/* Product photo size */}
                                <RangeSlider
                                    label="Product photo size"
                                    value={photoSize}
                                    min={20}
                                    max={100}
                                    onChange={(value: number | number[]) => setPhotoSize(typeof value === 'number' ? value : value[0])}
                                    output
                                />
                                {/* Other settings */}
                                <Text as="span" variant="headingSm">Other settings</Text>
                                <Checkbox
                                    label="Show product name"
                                    checked={showName}
                                    onChange={setShowName}
                                />
                                <Checkbox
                                    label={<>
                                        Show price of chosen products only
                                        <span title="Show only the price for selected products." style={{ marginLeft: 4 }}>ℹ️</span>
                                    </>}
                                    checked={showPriceOnly}
                                    onChange={setShowPriceOnly}
                                />
                                <Button fullWidth variant="primary" onClick={() => alert('Customize "Choose product" modal')}>Customize "Choose product" modal</Button>
                            </BlockStack>
                        </Box>
                    )}
                </Card>

                {/* Add Bar Button */}
                <Card padding="300">
                    <Button fullWidth variant="secondary" icon={PlusIcon}>
                        Add bar
                    </Button>
                </Card>
            </BlockStack>
        </Box>
    );
}
